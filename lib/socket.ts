/**
 * Socket.io Configuration & Event Handlers
 * Sincronización en tiempo real para el juego
 */

import { Server as HTTPServer } from "http"
import { Server as SocketIOServer, Socket } from "socket.io"
import { prisma } from "./prisma"
import { createGameEngine, CombatType, EnemyType } from "./game-engine"

interface GameSocket extends Socket {
  gameId?: string
  playerId?: string
  userId?: string
}

let io: SocketIOServer | null = null

/**
 * Inicializar Socket.io
 */
export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  if (io) return io

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      credentials: true,
    },
  })

  io.on("connection", (socket: GameSocket) => {
    console.log(`[Socket] Player connected: ${socket.id}`)

    // JOIN_GAME — jugador se conecta a una partida
    socket.on("game:join", async (data: { gameId: string; playerId: string; userId: string }) => {
      try {
        socket.gameId = data.gameId
        socket.playerId = data.playerId
        socket.userId = data.userId

        socket.join(`game:${data.gameId}`)
        console.log(`[Socket] Player ${data.playerId} joined game ${data.gameId}`)

        // Notificar a otros jugadores
        io!.to(`game:${data.gameId}`).emit("game:player-joined", {
          playerId: data.playerId,
          userId: data.userId,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        console.error("[Socket] Error joining game:", error)
        socket.emit("error", { message: "Failed to join game" })
      }
    })

    // MOVE — jugador se mueve
    socket.on("game:move", async (data: { dice: { number: number; direction: string } }) => {
      if (!socket.gameId || !socket.playerId) return

      try {
        const participation = await prisma.gameParticipation.findUnique({
          where: { id: socket.playerId },
        })

        if (!participation) return

        const game = await prisma.game.findUnique({
          where: { id: socket.gameId },
        })

        if (!game) return

        const engine = createGameEngine(game.tableSeed)

        // Decodificar posición
        const oldX = Math.floor(participation.position / 12)
        const oldY = participation.position % 12

        // Validar movimiento
        const result = engine.validateMovement(
          { x: oldX, y: oldY },
          {
            number: data.dice.number,
            direction: data.dice.direction as "up" | "down" | "left" | "right",
          }
        )

        if (!result.valid) {
          socket.emit("game:move-rejected", { reason: result.error })
          return
        }

        // Actualizar posición
        const newPosition = result.newPos.x * 12 + result.newPos.y
        await prisma.gameParticipation.update({
          where: { id: socket.playerId },
          data: { position: newPosition },
        })

        // Emitir a todos en la partida
        io!.to(`game:${socket.gameId}`).emit("game:player-moved", {
          playerId: socket.playerId,
          oldPos: { x: oldX, y: oldY },
          newPos: result.newPos,
          dice: data.dice,
          timestamp: new Date().toISOString(),
        })

        // Aplicar efecto de casilla
        const board = engine.getBoard()
        const cell = board.cells[result.newPos.y][result.newPos.x]

        switch (cell.type) {
          case "resource_common":
          case "resource_rare":
          case "resource_very_rare":
            io!.to(`game:${socket.gameId}`).emit("game:resource-found", {
              playerId: socket.playerId,
              resource: cell.content?.resourceType,
              position: result.newPos,
            })
            break

          case "enemy":
            io!.to(`game:${socket.gameId}`).emit("game:enemy-encounter", {
              playerId: socket.playerId,
              enemyType: cell.content?.enemyType,
              position: result.newPos,
            })
            break

          case "shop":
            socket.emit("game:shop-available")
            break
        }
      } catch (error) {
        console.error("[Socket] Error processing move:", error)
        socket.emit("error", { message: "Failed to process move" })
      }
    })

    // COMBAT — combate contra enemigo
    socket.on("game:attack", async (data: { enemyType: string; diceRoll: number }) => {
      if (!socket.gameId || !socket.playerId) return

      try {
        const participation = await prisma.gameParticipation.findUnique({
          where: { id: socket.playerId },
        })

        if (!participation) return

        const game = await prisma.game.findUnique({
          where: { id: socket.gameId },
        })

        if (!game) return

        const engine = createGameEngine(game.tableSeed)

        // Resolver combate
        const combatResult = engine.resolveCombat(
          10,
          5,
          CombatType.FIRE,
          participation.hp,
          data.enemyType as EnemyType,
          data.diceRoll
        )

        const newHP = Math.max(0, combatResult.playerHPAfter)
        const isAlive = newHP > 0

        await prisma.gameParticipation.update({
          where: { id: socket.playerId },
          data: {
            hp: newHP,
            isAlive,
            xp: participation.xp + (combatResult.playerWon ? 50 : 0),
          },
        })

        // Emitir resultado
        io!.to(`game:${socket.gameId}`).emit("game:combat-result", {
          playerId: socket.playerId,
          enemyType: data.enemyType,
          playerDamage: combatResult.playerDamage,
          enemyDamage: combatResult.enemyDamage,
          playerHPAfter: newHP,
          playerWon: combatResult.playerWon,
          timestamp: new Date().toISOString(),
        })

        // Si jugador fue eliminado
        if (!isAlive) {
          io!.to(`game:${socket.gameId}`).emit("game:player-eliminated", {
            playerId: socket.playerId,
            reason: "Combat defeat",
            timestamp: new Date().toISOString(),
          })
        }
      } catch (error) {
        console.error("[Socket] Error processing combat:", error)
        socket.emit("error", { message: "Failed to process combat" })
      }
    })

    // SELL — vender recurso
    socket.on("game:sell", async (data: { resourceType: string }) => {
      if (!socket.gameId || !socket.playerId) return

      try {
        const participation = await prisma.gameParticipation.findUnique({
          where: { id: socket.playerId },
        })

        if (!participation) return

        const game = await prisma.game.findUnique({
          where: { id: socket.gameId },
        })

        if (!game) return

        const engine = createGameEngine(game.tableSeed)
        const price = engine.getResourcePrice(data.resourceType as any)

        await prisma.gameParticipation.update({
          where: { id: socket.playerId },
          data: { money: participation.money + price },
        })

        io!.to(`game:${socket.gameId}`).emit("game:item-sold", {
          playerId: socket.playerId,
          resource: data.resourceType,
          price,
          newMoney: participation.money + price,
        })
      } catch (error) {
        console.error("[Socket] Error processing sell:", error)
        socket.emit("error", { message: "Failed to sell item" })
      }
    })

    // DISCONNECT
    socket.on("disconnect", () => {
      if (socket.gameId && socket.playerId) {
        console.log(`[Socket] Player ${socket.playerId} disconnected from game ${socket.gameId}`)
        io!.to(`game:${socket.gameId}`).emit("game:player-disconnected", {
          playerId: socket.playerId,
          timestamp: new Date().toISOString(),
        })
      }
    })
  })

  return io
}

/**
 * Obtener instancia de Socket.io
 */
export function getIO(): SocketIOServer | null {
  return io
}

/**
 * Emitir evento a una partida
 */
export function emitToGame(gameId: string, event: string, data: any) {
  if (io) {
    io.to(`game:${gameId}`).emit(event, data)
  }
}

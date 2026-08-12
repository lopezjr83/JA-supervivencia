/**
 * API Route para unirse a partida
 * POST /api/games/[gameId]/join
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createGameEngine } from "@/lib/game-engine"
import { JoinGameRequest, JoinGameResponse, ErrorResponse } from "@/lib/api-types"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params
    const body: JoinGameRequest = await req.json()

    if (!body.userId) {
      return NextResponse.json(
        { error: "Missing required field: userId" } as ErrorResponse,
        { status: 400 }
      )
    }

    // Obtener partida
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    })

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" } as ErrorResponse,
        { status: 404 }
      )
    }

    // Validar que la partida esté aceptando jugadores
    if (game.status !== "WAITING") {
      return NextResponse.json(
        { error: "Game is not accepting new players" } as ErrorResponse,
        { status: 400 }
      )
    }

    // Validar que haya espacio
    if (game.currentPlayers >= game.maxPlayers) {
      return NextResponse.json(
        { error: "Game is full" } as ErrorResponse,
        { status: 400 }
      )
    }

    // Verificar que el usuario no esté ya en la partida
    const existing = await prisma.gameParticipation.findFirst({
      where: {
        gameId,
        userId: body.userId,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "User is already in this game" } as ErrorResponse,
        { status: 400 }
      )
    }

    // Generar posición aleatoria para el jugador
    const engine = createGameEngine(game.tableSeed)
    const randomX = Math.floor(Math.random() * 12)
    const randomY = Math.floor(Math.random() * 12)

    // Crear participación del jugador
    // Codificar posición: x*12+y
    const position = randomX * 12 + randomY
    const participation = await prisma.gameParticipation.create({
      data: {
        gameId,
        userId: body.userId,
        role: "WARRIOR",
        position,
        hp: 100,
        money: 0,
      },
    })

    // Actualizar contador de jugadores
    await prisma.game.update({
      where: { id: gameId },
      data: {
        currentPlayers: game.currentPlayers + 1,
      },
    })

    // Si es el último jugador, cambiar estado a STARTED
    if (game.currentPlayers + 1 === game.maxPlayers) {
      await prisma.game.update({
        where: { id: gameId },
        data: { status: "STARTED" },
      })
    }

    // Obtener el tablero
    const board = engine.getBoard()

    const response: JoinGameResponse = {
      gameId,
      playerId: participation.id,
      position: {
        x: randomX,
        y: randomY,
      },
      role: participation.role,
      board: {
        width: board.width,
        height: board.height,
        cells: board.cells.map((row) =>
          row.map((cell) => ({
            type: cell.type,
            content: cell.content,
          }))
        ),
      },
      message: `Joined game ${gameId}. Players: ${game.currentPlayers + 1}/${game.maxPlayers}`,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Error joining game:", error)
    return NextResponse.json(
      { error: "Internal server error", details: String(error) } as ErrorResponse,
      { status: 500 }
    )
  }
}

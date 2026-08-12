/**
 * API Route para procesar movimiento
 * POST /api/games/[gameId]/move
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createGameEngine } from "@/lib/game-engine"
import { CellType } from "@/lib/game-engine"
import { ErrorResponse } from "@/lib/api-types"

interface MoveRequest {
  playerId: string
  dice: {
    number: number
    direction: "up" | "down" | "left" | "right"
  }
}

interface MoveResponse {
  playerId: string
  oldPosition: { x: number; y: number }
  newPosition: { x: number; y: number }
  cellType: string
  cellContent?: any
  effect?: {
    type: "resource" | "enemy" | "shop" | "empty"
    details?: any
  }
  message: string
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params
    const body: MoveRequest = await req.json()

    if (!body.playerId || !body.dice) {
      return NextResponse.json(
        { error: "Missing required fields: playerId, dice" } as ErrorResponse,
        { status: 400 }
      )
    }

    // Obtener participación del jugador
    const participation = await prisma.gameParticipation.findUnique({
      where: { id: body.playerId },
    })

    if (!participation || participation.gameId !== gameId) {
      return NextResponse.json(
        { error: "Player not found in this game" } as ErrorResponse,
        { status: 404 }
      )
    }

    if (!participation.isAlive) {
      return NextResponse.json(
        { error: "Player is eliminated" } as ErrorResponse,
        { status: 400 }
      )
    }

    // Obtener partida y tablero
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    })

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" } as ErrorResponse,
        { status: 404 }
      )
    }

    // Recrear GameEngine con el seed original
    const engine = createGameEngine(game.tableSeed)

    // Decodificar posición actual: position = x*12 + y
    const oldX = Math.floor(participation.position / 12)
    const oldY = participation.position % 12

    // Validar movimiento
    const result = engine.validateMovement(
      { x: oldX, y: oldY },
      { number: body.dice.number, direction: body.dice.direction }
    )

    if (!result.valid) {
      return NextResponse.json(
        { error: "Invalid movement", details: result.error } as ErrorResponse,
        { status: 400 }
      )
    }

    // Aplicar efecto de la casilla
    const board = engine.getBoard()
    const cell = board.cells[result.newPos.y][result.newPos.x]

    let effect: any = null
    let response_message = "Moved successfully"

    switch (cell.type) {
      case CellType.RESOURCE_COMMON:
      case CellType.RESOURCE_RARE:
      case CellType.RESOURCE_VERY_RARE:
        // Obtener recurso
        const resource = cell.content?.resourceType
        const price = engine.getResourcePrice(resource as any)
        effect = {
          type: "resource",
          details: {
            resource,
            price,
          },
        }
        response_message = `Found ${resource}! (Worth $${price})`
        break

      case CellType.ENEMY:
        // Encuentro con enemigo - se resuelve en otra ruta
        effect = {
          type: "enemy",
          details: {
            enemyType: cell.content?.enemyType,
          },
        }
        response_message = "Encountered an enemy!"
        break

      case CellType.SHOP:
        effect = {
          type: "shop",
          details: {
            available: ["weapon", "armor", "potion"],
          },
        }
        response_message = "Found a shop!"
        break

      default:
        effect = {
          type: "empty",
        }
        response_message = "Empty cell"
    }

    // Codificar nueva posición
    const newPosition = result.newPos.x * 12 + result.newPos.y

    // Actualizar posición en BD
    await prisma.gameParticipation.update({
      where: { id: body.playerId },
      data: { position: newPosition },
    })

    // Registrar evento
    await prisma.gameEvent.create({
      data: {
        gameId,
        type: "MOVE",
        description: `Player moved from (${oldX},${oldY}) to (${result.newPos.x},${result.newPos.y})`,
        data: {
          playerId: body.playerId,
          oldPos: { x: oldX, y: oldY },
          newPos: { x: result.newPos.x, y: result.newPos.y },
          dice: body.dice,
          cellType: cell.type,
        },
      },
    })

    const response: MoveResponse = {
      playerId: body.playerId,
      oldPosition: { x: oldX, y: oldY },
      newPosition: { x: result.newPos.x, y: result.newPos.y },
      cellType: cell.type,
      cellContent: cell.content,
      effect,
      message: response_message,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Error processing move:", error)
    return NextResponse.json(
      { error: "Internal server error", details: String(error) } as ErrorResponse,
      { status: 500 }
    )
  }
}

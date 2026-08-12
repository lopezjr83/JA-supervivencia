/**
 * API Routes para gestión de partidas
 * POST /api/games — crear partida
 * GET /api/games — listar partidas
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createGameEngine } from "@/lib/game-engine"
import { CreateGameRequest, CreateGameResponse, ListGamesResponse, ErrorResponse } from "@/lib/api-types"

/**
 * POST /api/games
 * Crear una nueva partida
 */
export async function POST(req: NextRequest) {
  try {
    const body: CreateGameRequest = await req.json()

    // Validar request
    if (!body.mode || !body.maxPlayers) {
      return NextResponse.json(
        { error: "Missing required fields: mode, maxPlayers" } as ErrorResponse,
        { status: 400 }
      )
    }

    if (!["PRIVATE", "RANKED"].includes(body.mode)) {
      return NextResponse.json(
        { error: "Invalid mode. Must be PRIVATE or RANKED" } as ErrorResponse,
        { status: 400 }
      )
    }

    if (![2, 4, 6, 8].includes(body.maxPlayers)) {
      return NextResponse.json(
        { error: "Invalid maxPlayers. Must be 2, 4, 6, or 8" } as ErrorResponse,
        { status: 400 }
      )
    }

    // Crear tablero con seed único
    const seed = Math.random().toString(36).substring(7)
    const gameEngine = createGameEngine(seed)
    const board = gameEngine.getBoard()

    // Guardar en base de datos
    const game = await prisma.game.create({
      data: {
        mode: body.mode as "PRIVATE" | "RANKED",
        maxPlayers: body.maxPlayers,
        currentPlayers: 0,
        tableSeed: seed,
        status: "WAITING",
      },
    })

    // Crear estado del juego
    await prisma.gameState.create({
      data: {
        gameId: game.id,
        boardData: JSON.stringify(board),
        currentTurn: 1,
        safeZone: JSON.stringify({ x1: 0, y1: 0, x2: 11, y2: 11 }),
      },
    })

    const response: CreateGameResponse = {
      gameId: game.id,
      mode: game.mode,
      maxPlayers: game.maxPlayers,
      currentPlayers: game.currentPlayers,
      createdAt: game.createdAt.toISOString(),
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Error creating game:", error)
    return NextResponse.json(
      { error: "Internal server error", details: String(error) } as ErrorResponse,
      { status: 500 }
    )
  }
}

/**
 * GET /api/games
 * Listar partidas activas (WAITING o STARTED)
 */
export async function GET(req: NextRequest) {
  try {
    const mode = req.nextUrl.searchParams.get("mode") // PRIVATE o RANKED
    const status = req.nextUrl.searchParams.get("status") // WAITING, STARTED, FINISHED

    const where: any = {}
    if (mode && ["PRIVATE", "RANKED"].includes(mode)) {
      where.mode = mode
    }
    if (status && ["WAITING", "STARTED", "FINISHED"].includes(status)) {
      where.status = status
    }

    const games = await prisma.game.findMany({
      where,
      select: {
        id: true,
        mode: true,
        maxPlayers: true,
        currentPlayers: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const response: ListGamesResponse = {
      games: games.map((g: any) => ({
        gameId: g.id,
        mode: g.mode,
        maxPlayers: g.maxPlayers,
        currentPlayers: g.currentPlayers,
        status: g.status,
        createdAt: g.createdAt.toISOString(),
      })),
      total: games.length,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error listing games:", error)
    return NextResponse.json(
      { error: "Internal server error", details: String(error) } as ErrorResponse,
      { status: 500 }
    )
  }
}

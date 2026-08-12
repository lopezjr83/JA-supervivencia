/**
 * API Route para procesar acciones (vender, comprar, atacar)
 * POST /api/games/[gameId]/action
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createGameEngine, CombatType, EnemyType } from "@/lib/game-engine"
import { ErrorResponse } from "@/lib/api-types"

interface ActionRequest {
  playerId: string
  action: "sell" | "buy" | "attack" | "use-item"
  payload?: any
}

interface ActionResponse {
  playerId: string
  action: string
  result: "success" | "failed"
  data?: any
  message: string
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params
    const body: ActionRequest = await req.json()

    if (!body.playerId || !body.action) {
      return NextResponse.json(
        { error: "Missing required fields: playerId, action" } as ErrorResponse,
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

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    })

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" } as ErrorResponse,
        { status: 404 }
      )
    }

    const engine = createGameEngine(game.tableSeed)

    let response: ActionResponse = {
      playerId: body.playerId,
      action: body.action,
      result: "failed",
      message: "Unknown action",
    }

    // SELL — vender recurso por dinero
    if (body.action === "sell") {
      const { resourceType } = body.payload
      if (!resourceType) {
        return NextResponse.json(
          { error: "Missing payload: resourceType" } as ErrorResponse,
          { status: 400 }
        )
      }

      const price = engine.getResourcePrice(resourceType as any)
      await prisma.gameParticipation.update({
        where: { id: body.playerId },
        data: {
          money: participation.money + price,
        },
      })

      await prisma.gameEvent.create({
        data: {
          gameId,
          type: "ITEM_SOLD",
          description: `Player sold ${resourceType} for $${price}`,
          data: { playerId: body.playerId, resourceType, price },
        },
      })

      response = {
        playerId: body.playerId,
        action: "sell",
        result: "success",
        data: { resourceType, price, newMoney: participation.money + price },
        message: `Sold ${resourceType} for $${price}`,
      }
    }

    // BUY — comprar en tienda
    else if (body.action === "buy") {
      const { itemType, cost } = body.payload
      if (!itemType || !cost) {
        return NextResponse.json(
          { error: "Missing payload: itemType, cost" } as ErrorResponse,
          { status: 400 }
        )
      }

      if (participation.money < cost) {
        return NextResponse.json(
          { error: "Not enough money", details: `Need $${cost}, have $${participation.money}` } as ErrorResponse,
          { status: 400 }
        )
      }

      await prisma.gameParticipation.update({
        where: { id: body.playerId },
        data: {
          money: participation.money - cost,
        },
      })

      await prisma.gameEvent.create({
        data: {
          gameId,
          type: "ITEM_PURCHASED",
          description: `Player bought ${itemType} for $${cost}`,
          data: { playerId: body.playerId, itemType, cost },
        },
      })

      response = {
        playerId: body.playerId,
        action: "buy",
        result: "success",
        data: { itemType, cost, newMoney: participation.money - cost },
        message: `Bought ${itemType} for $${cost}`,
      }
    }

    // ATTACK — atacar enemigo
    else if (body.action === "attack") {
      const { enemyType, diceRoll } = body.payload
      if (!enemyType || !diceRoll) {
        return NextResponse.json(
          { error: "Missing payload: enemyType, diceRoll" } as ErrorResponse,
          { status: 400 }
        )
      }

      // Resolver combate
      const combatResult = engine.resolveCombat(
        10, // ATK del jugador (simplificado, debería venir de stats)
        5, // DEF del jugador
        CombatType.FIRE, // Tipo del jugador (simplificado)
        participation.hp,
        enemyType as EnemyType,
        diceRoll
      )

      // Actualizar HP del jugador
      const newHP = Math.max(0, combatResult.playerHPAfter)
      const isAlive = newHP > 0

      await prisma.gameParticipation.update({
        where: { id: body.playerId },
        data: {
          hp: newHP,
          isAlive,
        },
      })

      await prisma.gameEvent.create({
        data: {
          gameId,
          type: "COMBAT",
          description: `Combat: Player vs ${enemyType}. Player took ${combatResult.enemyDamage} damage.`,
          data: {
            playerId: body.playerId,
            enemyType,
            playerDamage: combatResult.playerDamage,
            enemyDamage: combatResult.enemyDamage,
            playerHPAfter: combatResult.playerHPAfter,
            enemyHPAfter: combatResult.enemyHPAfter,
            playerWon: combatResult.playerWon,
          } as any,
        },
      })

      // Si el enemigo fue vencido, dar XP y recursos
      let reward = null
      if (combatResult.playerWon) {
        const xpGain = 50
        const resourceGain = 20
        await prisma.gameParticipation.update({
          where: { id: body.playerId },
          data: {
            xp: participation.xp + xpGain,
            money: participation.money + resourceGain,
          },
        })
        reward = { xp: xpGain, money: resourceGain }
      }

      response = {
        playerId: body.playerId,
        action: "attack",
        result: "success",
        data: {
          enemyType,
          playerDamage: combatResult.playerDamage,
          enemyDamage: combatResult.enemyDamage,
          playerHPAfter: newHP,
          playerWon: combatResult.playerWon,
          reward,
        } as any,
        message: combatResult.playerWon
          ? `Defeated ${enemyType}! Gained ${reward?.xp} XP`
          : `Took ${combatResult.enemyDamage} damage from ${enemyType}!`,
      }
    }

    // USE-ITEM — usar item/poción
    else if (body.action === "use-item") {
      const { itemType, effect } = body.payload
      if (!itemType || !effect) {
        return NextResponse.json(
          { error: "Missing payload: itemType, effect" } as ErrorResponse,
          { status: 400 }
        )
      }

      if (itemType === "potion" && effect.hpRestore) {
        const newHP = Math.min(100, participation.hp + effect.hpRestore)
        await prisma.gameParticipation.update({
          where: { id: body.playerId },
          data: { hp: newHP },
        })

        response = {
          playerId: body.playerId,
          action: "use-item",
          result: "success",
          data: { itemType, hpRestored: newHP - participation.hp, newHP },
          message: `Used ${itemType}. HP: ${participation.hp} → ${newHP}`,
        }
      }
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error("Error processing action:", error)
    return NextResponse.json(
      { error: "Internal server error", details: String(error) } as ErrorResponse,
      { status: 500 }
    )
  }
}

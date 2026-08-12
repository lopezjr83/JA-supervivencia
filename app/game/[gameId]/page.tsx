/**
 * Game Page — Juego en vivo
 * app/game/[gameId]/page.tsx
 */

"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import GameBoard from "@/components/game-board"
import InventoryPanel from "@/components/inventory-panel"
import DiceRoller from "@/components/dice-roller"
import { useSocket, GameEvents } from "@/lib/socket-client"

interface PlayerState {
  playerId: string
  userId: string
  position: { x: number; y: number }
  hp: number
  money: number
  xp: number
}

interface GameState {
  gameId: string
  board: any
  players: PlayerState[]
  currentPlayer?: PlayerState
}

export default function GamePage() {
  const params = useParams()
  const gameId = params.gameId as string
  const socket = useSocket()

  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null)

  // JOIN GAME
  useEffect(() => {
    const joinGame = async () => {
      try {
        // Simulación: usar userId "test-user"
        const userId = localStorage.getItem("userId") || "test-user-" + Math.random()
        localStorage.setItem("userId", userId)

        // Unirse a partida via API
        const res = await fetch(`/api/games/${gameId}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        })

        if (!res.ok) throw new Error("Failed to join game")
        const data = await res.json()

        setGameState({
          gameId,
          board: data.board,
          players: [
            {
              playerId: data.playerId,
              userId,
              position: data.position,
              hp: 100,
              money: 0,
              xp: 0,
            },
          ],
          currentPlayer: {
            playerId: data.playerId,
            userId,
            position: data.position,
            hp: 100,
            money: 0,
            xp: 0,
          },
        })

        // Conectar a Socket.io
        socket.emit(GameEvents.JOIN_GAME, {
          gameId,
          playerId: data.playerId,
          userId,
        })

        setLoading(false)
      } catch (err) {
        setError(String(err))
        setLoading(false)
      }
    }

    joinGame()
  }, [gameId, socket])

  // SOCKET LISTENERS
  useEffect(() => {
    const handlePlayerMoved = (data: any) => {
      setGameState((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.playerId === data.playerId
              ? { ...p, position: data.newPos }
              : p
          ),
        }
      })
    }

    const handleCombatResult = (data: any) => {
      setGameState((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.playerId === data.playerId
              ? { ...p, hp: data.playerHPAfter }
              : p
          ),
        }
      })
    }

    const handlePlayerEliminated = (data: any) => {
      setGameState((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          players: prev.players.filter((p) => p.playerId !== data.playerId),
        }
      })
    }

    socket.on(GameEvents.PLAYER_MOVED, handlePlayerMoved)
    socket.on(GameEvents.COMBAT_RESULT, handleCombatResult)
    socket.on(GameEvents.PLAYER_ELIMINATED, handlePlayerEliminated)

    return () => {
      socket.off(GameEvents.PLAYER_MOVED, handlePlayerMoved)
      socket.off(GameEvents.COMBAT_RESULT, handleCombatResult)
      socket.off(GameEvents.PLAYER_ELIMINATED, handlePlayerEliminated)
    }
  }, [socket])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Uniéndote a partida...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    )
  }

  if (!gameState || !gameState.currentPlayer) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando juego...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold">🏝️ Supervivencia en Isla</h1>
          <div className="text-sm text-slate-400">
            Partida: {gameId.slice(0, 8)}...
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Board (3 columns) */}
          <div className="lg:col-span-3">
            <GameBoard
              board={gameState.board}
              players={gameState.players}
              selectedCell={selectedCell}
              onCellSelect={setSelectedCell}
            />
          </div>

          {/* Sidebar (1 column) */}
          <div className="space-y-4">
            <InventoryPanel
              hp={gameState.currentPlayer.hp}
              money={gameState.currentPlayer.money}
              xp={gameState.currentPlayer.xp}
              position={gameState.currentPlayer.position}
            />

            <DiceRoller
              onRoll={(dice) => {
                socket.emit(GameEvents.MOVE, { dice })
              }}
            />

            {/* Online Players */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="font-semibold mb-3">Jugadores Activos</h3>
              <div className="space-y-2 text-sm">
                {gameState.players.map((p) => (
                  <div
                    key={p.playerId}
                    className={`p-2 rounded ${
                      p.playerId === gameState.currentPlayer?.playerId
                        ? "bg-green-900 border-l-2 border-green-500"
                        : "bg-slate-700"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{p.userId}</span>
                      <span className="text-red-400">❤️ {p.hp}</span>
                    </div>
                    <div className="text-slate-400 text-xs">
                      ({p.position.x}, {p.position.y})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

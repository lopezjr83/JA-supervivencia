/**
 * Home Page — Lobby del juego
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [gameMode, setGameMode] = useState<"PRIVATE" | "RANKED">("PRIVATE")

  const createGame = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: gameMode,
          maxPlayers: gameMode === "PRIVATE" ? 4 : 8,
        }),
      })

      if (!res.ok) throw new Error("Failed to create game")
      const { gameId } = await res.json()
      router.push(`/game/${gameId}`)
    } catch (error) {
      console.error("Error creating game:", error)
      alert("Error creating game")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏝️ Supervivencia en Isla
          </h1>
          <p className="text-slate-300">
            Tablero 12×12 · Dados · Combate · Último sobrevive
          </p>
        </div>

        {/* Game Mode Selection */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Modo de Juego</h2>

          <div className="space-y-3">
            {/* PRIVATE */}
            <label className="flex items-center p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
              <input
                type="radio"
                name="mode"
                value="PRIVATE"
                checked={gameMode === "PRIVATE"}
                onChange={(e) => setGameMode(e.target.value as "PRIVATE" | "RANKED")}
                className="w-4 h-4"
              />
              <div className="ml-3">
                <div className="text-white font-medium">Privado</div>
                <div className="text-sm text-slate-400">2-4 jugadores, amigos</div>
              </div>
            </label>

            {/* RANKED */}
            <label className="flex items-center p-3 bg-slate-700 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
              <input
                type="radio"
                name="mode"
                value="RANKED"
                checked={gameMode === "RANKED"}
                onChange={(e) => setGameMode(e.target.value as "PRIVATE" | "RANKED")}
                className="w-4 h-4"
              />
              <div className="ml-3">
                <div className="text-white font-medium">Clasificatorio</div>
                <div className="text-sm text-slate-400">6-8 jugadores, ranqueado</div>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={createGame}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors mb-3"
        >
          {loading ? "Creando..." : "Crear Partida"}
        </button>

        <Link
          href="/games"
          className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg transition-colors"
        >
          Unirse a Partida
        </Link>

        {/* Footer */}
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>Para: Juan Andrés</p>
          <p className="mt-1">Stack: Next.js 16 · Prisma · Socket.io</p>
        </div>
      </div>
    </div>
  )
}

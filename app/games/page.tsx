/**
 * Games List Page — Listar partidas activas
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Game {
  gameId: string
  mode: string
  maxPlayers: number
  currentPlayers: number
  status: string
  createdAt: string
}

export default function GamesPage() {
  const router = useRouter()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "PRIVATE" | "RANKED">("all")

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const query = filter === "all" ? "" : `?mode=${filter}`
        const res = await fetch(`/api/games${query}`)
        if (!res.ok) throw new Error("Failed to fetch games")
        const data = await res.json()
        setGames(data.games)
      } catch (error) {
        console.error("Error fetching games:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
    const interval = setInterval(fetchGames, 5000) // Actualizar cada 5s

    return () => clearInterval(interval)
  }, [filter])

  const handleJoin = (gameId: string) => {
    router.push(`/game/${gameId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold mb-2">Partidas Disponibles</h1>
          <p className="text-slate-400">Únete a una partida en vivo</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-6">
          {["all", "PRIVATE", "RANKED"].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode as any)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                filter === mode
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {mode === "all" ? "Todas" : mode === "PRIVATE" ? "Privadas" : "Clasificatorio"}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center text-slate-400">
            <p>Cargando partidas...</p>
          </div>
        )}

        {/* Games List */}
        {!loading && games.length === 0 && (
          <div className="text-center text-slate-400 py-12">
            <p className="text-xl mb-4">No hay partidas disponibles</p>
            <Link
              href="/"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              Crear nueva partida
            </Link>
          </div>
        )}

        {!loading && games.length > 0 && (
          <div className="grid gap-4">
            {games.map((game) => (
              <div
                key={game.gameId}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold mb-2">
                      {game.mode === "PRIVATE" ? "🔒 Privada" : "🏆 Clasificatorio"}
                    </h2>
                    <div className="text-slate-400 text-sm space-y-1">
                      <p>Estado: {game.status}</p>
                      <p>
                        Jugadores: {game.currentPlayers}/{game.maxPlayers}
                      </p>
                      <p>
                        Creada hace:{" "}
                        {Math.round(
                          (Date.now() - new Date(game.createdAt).getTime()) / 1000 / 60
                        )}
                        m
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-24 text-right">
                    <div className="text-2xl font-bold text-green-400 mb-2">
                      {game.currentPlayers}/{game.maxPlayers}
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${(game.currentPlayers / game.maxPlayers) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Join Button */}
                <button
                  onClick={() => handleJoin(game.gameId)}
                  disabled={game.status !== "WAITING"}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold py-2 rounded transition-colors"
                >
                  {game.status === "WAITING"
                    ? "Unirse"
                    : game.status === "STARTED"
                      ? "En progreso"
                      : "Finalizada"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Create New Game */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded transition-colors text-lg"
          >
            + Crear Nueva Partida
          </Link>
        </div>
      </div>
    </div>
  )
}

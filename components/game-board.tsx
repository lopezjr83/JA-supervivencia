/**
 * GameBoard — Tablero 12×12 interactivo
 */

"use client"

import { CellType } from "@/lib/game-engine"

interface GameBoardProps {
  board: {
    width: number
    height: number
    cells: Array<
      Array<{
        type: string
        content?: any
      }>
    >
  }
  players: Array<{
    playerId: string
    position: { x: number; y: number }
    hp: number
  }>
  selectedCell: { x: number; y: number } | null
  onCellSelect: (cell: { x: number; y: number }) => void
}

const CELL_ICONS: Record<string, string> = {
  [CellType.EMPTY]: "⬜",
  [CellType.RESOURCE_COMMON]: "🪵",
  [CellType.RESOURCE_RARE]: "💎",
  [CellType.RESOURCE_VERY_RARE]: "✨",
  [CellType.ENEMY]: "👹",
  [CellType.SHOP]: "🏪",
}

export default function GameBoard({
  board,
  players,
  selectedCell,
  onCellSelect,
}: GameBoardProps) {
  const cellSize = "w-10 h-10"

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 overflow-auto">
      {/* Title */}
      <h2 className="text-lg font-semibold mb-3">Tablero 12×12</h2>

      {/* Grid */}
      <div
        className="inline-grid gap-0.5 bg-slate-900 p-3 rounded"
        style={{
          gridTemplateColumns: `repeat(${board.width}, minmax(0, 1fr))`,
        }}
      >
        {board.cells.map((row, y) =>
          row.map((cell, x) => {
            const player = players.find((p) => p.position.x === x && p.position.y === y)
            const isSelected = selectedCell?.x === x && selectedCell?.y === y
            const isEmpty = cell.type === CellType.EMPTY

            return (
              <button
                key={`${x}-${y}`}
                onClick={() => onCellSelect({ x, y })}
                className={`
                  ${cellSize} rounded text-lg font-bold flex items-center justify-center
                  transition-all duration-200 cursor-pointer
                  ${
                    player
                      ? "bg-blue-600 hover:bg-blue-500 relative"
                      : isSelected
                        ? "bg-yellow-500 ring-2 ring-yellow-300"
                        : isEmpty
                          ? "bg-slate-700 hover:bg-slate-600"
                          : "bg-slate-600 hover:bg-slate-500"
                  }
                `}
                title={`(${x}, ${y}) - ${cell.type}`}
              >
                {/* Player */}
                {player && (
                  <div className="relative">
                    <span className="text-xl">🧑</span>
                    <span className="absolute -top-2 -right-2 text-xs bg-red-600 rounded-full w-4 h-4 flex items-center justify-center">
                      {player.hp}
                    </span>
                  </div>
                )}

                {/* Cell Content */}
                {!player && CELL_ICONS[cell.type] && (
                  <span className="text-sm opacity-70">{CELL_ICONS[cell.type]}</span>
                )}
              </button>
            )
          })
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-xl">🪵</span>
          <span>Recurso Común</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">💎</span>
          <span>Recurso Raro</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">✨</span>
          <span>Muy Raro</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">👹</span>
          <span>Enemigo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">🏪</span>
          <span>Tienda</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">🧑</span>
          <span>Jugador</span>
        </div>
      </div>
    </div>
  )
}

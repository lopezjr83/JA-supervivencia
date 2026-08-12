/**
 * DiceRoller — UI para tirar dados y seleccionar dirección
 */

"use client"

import { useState } from "react"

interface DiceRollerProps {
  onRoll: (dice: { number: number; direction: "up" | "down" | "left" | "right" }) => void
}

export default function DiceRoller({ onRoll }: DiceRollerProps) {
  const [rolling, setRolling] = useState(false)
  const [lastRoll, setLastRoll] = useState<{ number: number; direction: string } | null>(
    null
  )
  const [selectedDirection, setSelectedDirection] = useState<
    "up" | "down" | "left" | "right" | null
  >(null)

  const rollDice = () => {
    if (!selectedDirection) return

    setRolling(true)

    // Simular animación de tirada
    setTimeout(() => {
      const number = Math.floor(Math.random() * 6) + 1
      setLastRoll({ number, direction: selectedDirection })
      setRolling(false)

      // Emitir evento
      onRoll({
        number,
        direction: selectedDirection as "up" | "down" | "left" | "right",
      })
    }, 600)
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-semibold mb-4">Tirar Dados</h3>

      {/* Dice Display */}
      <div className="bg-slate-900 rounded p-6 mb-4 text-center">
        <div
          className={`text-6xl font-bold transition-transform duration-300 ${
            rolling ? "animate-bounce" : ""
          }`}
        >
          {lastRoll?.number || "?"}
        </div>
        <div className="text-sm text-slate-400 mt-2">
          {lastRoll ? `Dirección: ${lastRoll.direction}` : "Selecciona dirección"}
        </div>
      </div>

      {/* Direction Selection */}
      <div className="mb-4">
        <p className="text-sm text-slate-300 mb-2">Dirección:</p>
        <div className="grid grid-cols-3 gap-2">
          {/* Up */}
          <div className="col-span-3 flex justify-center mb-1">
            <button
              onClick={() => setSelectedDirection("up")}
              className={`w-12 h-12 rounded font-bold transition-colors ${
                selectedDirection === "up"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600"
              }`}
              disabled={rolling}
            >
              ⬆️
            </button>
          </div>

          {/* Left, Down, Right */}
          <button
            onClick={() => setSelectedDirection("left")}
            className={`h-12 rounded font-bold transition-colors ${
              selectedDirection === "left"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-400 hover:bg-slate-600"
            }`}
            disabled={rolling}
          >
            ⬅️
          </button>
          <button
            onClick={() => setSelectedDirection("down")}
            className={`h-12 rounded font-bold transition-colors ${
              selectedDirection === "down"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-400 hover:bg-slate-600"
            }`}
            disabled={rolling}
          >
            ⬇️
          </button>
          <button
            onClick={() => setSelectedDirection("right")}
            className={`h-12 rounded font-bold transition-colors ${
              selectedDirection === "right"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-400 hover:bg-slate-600"
            }`}
            disabled={rolling}
          >
            ➡️
          </button>
        </div>
      </div>

      {/* Roll Button */}
      <button
        onClick={rollDice}
        disabled={!selectedDirection || rolling}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-bold py-3 rounded transition-colors"
      >
        {rolling ? "Tirando..." : "Tirar Dado"}
      </button>

      {/* Last Roll Info */}
      {lastRoll && (
        <div className="mt-4 p-3 bg-slate-900 rounded border-l-4 border-green-500">
          <p className="text-sm">
            <span className="text-green-400 font-bold">Última tirada:</span>{" "}
            {lastRoll.number} espacios hacia {lastRoll.direction}
          </p>
        </div>
      )}
    </div>
  )
}

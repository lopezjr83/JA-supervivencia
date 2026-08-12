/**
 * InventoryPanel — Panel de inventario y stats
 */

interface InventoryPanelProps {
  hp: number
  money: number
  xp: number
  position: { x: number; y: number }
}

export default function InventoryPanel({
  hp,
  money,
  xp,
  position,
}: InventoryPanelProps) {
  const hpPercent = (hp / 100) * 100

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 space-y-4">
      {/* Position */}
      <div className="bg-slate-700 rounded p-3">
        <h3 className="text-sm font-semibold text-slate-300 mb-1">Posición</h3>
        <div className="text-2xl font-bold">
          ({position.x}, {position.y})
        </div>
      </div>

      {/* Health */}
      <div className="bg-slate-700 rounded p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-slate-300">Salud</h3>
          <span className="font-bold text-red-400">{hp}/100</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-6 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              hp > 50 ? "bg-green-500" : hp > 25 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      {/* Money */}
      <div className="bg-slate-700 rounded p-3">
        <h3 className="text-sm font-semibold text-slate-300 mb-1">Dinero</h3>
        <div className="text-2xl font-bold text-yellow-400">
          💰 ${money}
        </div>
      </div>

      {/* XP */}
      <div className="bg-slate-700 rounded p-3">
        <h3 className="text-sm font-semibold text-slate-300 mb-1">Experiencia</h3>
        <div className="text-2xl font-bold text-purple-400">
          ⭐ {xp} XP
        </div>
      </div>

      {/* Inventory Placeholder */}
      <div className="bg-slate-700 rounded p-3">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Mochila</h3>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square bg-slate-900 rounded border border-slate-600 flex items-center justify-center text-xs text-slate-500"
            >
              Vacío
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

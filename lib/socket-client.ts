/**
 * Socket.io Client Setup
 * Para usar en componentes React
 */

import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

/**
 * Conectar al servidor Socket.io
 */
export function connectSocket(): Socket {
  if (socket && socket.connected) {
    return socket
  }

  const url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000"

  socket = io(url, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  })

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket?.id)
  })

  socket.on("disconnect", () => {
    console.log("[Socket] Disconnected")
  })

  socket.on("error", (error) => {
    console.error("[Socket] Error:", error)
  })

  return socket
}

/**
 * Obtener instancia de Socket.io
 */
export function getSocket(): Socket | null {
  return socket
}

/**
 * Desconectar del servidor
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

/**
 * Hook para React (uso: useSocket() en componentes)
 */
export function useSocket(): Socket {
  if (!socket) {
    connectSocket()
  }
  return socket!
}

/**
 * Event listeners del juego
 */
export const GameEvents = {
  // Emitir
  JOIN_GAME: "game:join",
  MOVE: "game:move",
  ATTACK: "game:attack",
  SELL: "game:sell",
  BUY: "game:buy",
  USE_ITEM: "game:use-item",

  // Recibir
  PLAYER_JOINED: "game:player-joined",
  PLAYER_MOVED: "game:player-moved",
  PLAYER_ELIMINATED: "game:player-eliminated",
  PLAYER_DISCONNECTED: "game:player-disconnected",
  COMBAT_RESULT: "game:combat-result",
  RESOURCE_FOUND: "game:resource-found",
  ENEMY_ENCOUNTER: "game:enemy-encounter",
  ITEM_SOLD: "game:item-sold",
  SHOP_AVAILABLE: "game:shop-available",
  ERROR: "error",
}

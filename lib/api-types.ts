/**
 * Tipos para API responses
 */

export interface CreateGameRequest {
  mode: "PRIVATE" | "RANKED"
  maxPlayers: 2 | 4 | 6 | 8
}

export interface CreateGameResponse {
  gameId: string
  mode: string
  maxPlayers: number
  currentPlayers: number
  joinCode?: string
  createdAt: string
}

export interface ListGamesResponse {
  games: Array<{
    gameId: string
    mode: string
    maxPlayers: number
    currentPlayers: number
    status: string
    createdAt: string
  }>
  total: number
}

export interface JoinGameRequest {
  userId: string
}

export interface JoinGameResponse {
  gameId: string
  playerId: string
  position: {
    x: number
    y: number
  }
  role: string
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
  message: string
}

export interface ErrorResponse {
  error: string
  details?: string
}

import type { Variant, GameState } from '../game/types'

export type RoomStatus = 'waiting' | 'in-progress' | 'finished'

export interface RoomPlayer {
  uid: string
  displayName: string
  isHost: boolean
  isReady: boolean
  isConnected: boolean
  lastSeen: number
  teamIndex?: number
}

export interface ChatMessage {
  id: string
  uid: string
  displayName: string
  text: string
  timestamp: number
}

export type MultiplayerAction =
  | { type: 'draw-stock' }
  | { type: 'pick-up-pile' }
  | { type: 'place-meld'; cardIds: string[] }
  | { type: 'add-to-meld'; meldIndex: number; ownerPlayerId: string; cardIds: string[] }
  | { type: 'discard'; cardId: string }

export interface MultiplayerRoom {
  id: string
  inviteCode: string
  variant: Variant
  hostId: string
  players: RoomPlayer[]
  status: RoomStatus
  currentPlayerIndex: number
  gameState: GameState | null
  pendingAction: MultiplayerAction | null
  chat: ChatMessage[]
  createdAt: number
  updatedAt: number
}

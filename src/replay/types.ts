import type { GameState } from '../game/types'

/** One recorded action taken during a game. */
export interface ReplayAction {
  /** Which player took this action (player id). */
  playerId: string
  /** A human-readable description of the action. */
  description: string
  /** Full game state *before* this action was applied. */
  stateBefore: GameState
  /** Turn number (1-based). */
  turnNumber: number
  timestamp: number
}

/** A complete recorded game that can be replayed. */
export interface GameReplay {
  /** Unique replay / game ID. */
  id: string
  /** UID of the user who saved this replay (null for AI games). */
  ownerUid: string | null
  /** Display name(s) for the players. */
  playerNames: string[]
  /** '2p' | '3p' | '4p-partnership' */
  variant: string
  /** Ordered list of recorded actions. */
  actions: ReplayAction[]
  /** Final game state after the last action. */
  finalState: GameState | null
  /** ISO date string or timestamp of when the game was played. */
  playedAt: number
  /** Whether the replay link is publicly shareable. */
  isPublic: boolean
}

import type { Variant } from '../game/types'

export type TournamentFormat = 'round-robin' | 'single-elimination'
export type TournamentStatus = 'registering' | 'in-progress' | 'finished'
export type MatchStatus = 'pending' | 'in-progress' | 'finished'

export interface TournamentPlayer {
  uid: string
  displayName: string
  /** Elo rating at the time of joining */
  elo: number
  /** Points accumulated in this tournament (round-robin) */
  points: number
  wins: number
  losses: number
  /** Seeding position (1-indexed) */
  seed: number
}

export interface TournamentMatch {
  id: string
  round: number
  /** Index into tournament.players array */
  player1Uid: string
  player2Uid: string
  player1Score: number
  player2Score: number
  winnerUid: string | null
  status: MatchStatus
  /** ISO timestamp when the match finished */
  finishedAt: string | null
}

export interface Tournament {
  id: string
  name: string
  variant: Variant
  format: TournamentFormat
  status: TournamentStatus
  /** Maximum number of players (2–8) */
  maxPlayers: number
  players: TournamentPlayer[]
  matches: TournamentMatch[]
  /** Total rounds (computed when started) */
  rounds: number
  createdBy: string
  createdAt: number
  updatedAt: number
}

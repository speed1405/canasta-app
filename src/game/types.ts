// Core types for the Canasta training app

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Rank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'Joker'

export interface Card {
  rank: Rank
  suit: Suit | null // null for Jokers
  id: string // unique identifier: e.g. "A-hearts-0"
}

// Card categories
export type CardCategory = 'wild' | 'red3' | 'black3' | 'natural'

export function cardCategory(card: Card): CardCategory {
  if (card.rank === 'Joker' || card.rank === '2') return 'wild'
  if (card.rank === '3' && (card.suit === 'hearts' || card.suit === 'diamonds'))
    return 'red3'
  if (card.rank === '3' && (card.suit === 'clubs' || card.suit === 'spades'))
    return 'black3'
  return 'natural'
}

export function isWild(card: Card): boolean {
  return cardCategory(card) === 'wild'
}

export function isRed3(card: Card): boolean {
  return cardCategory(card) === 'red3'
}

export function isBlack3(card: Card): boolean {
  return cardCategory(card) === 'black3'
}

// Point value of a card when it is in a meld or left in hand
export function cardPointValue(card: Card): number {
  if (card.rank === 'Joker') return 50
  if (card.rank === '2') return 20
  if (card.rank === 'A') return 20
  if (['8', '9', '10', 'J', 'Q', 'K'].includes(card.rank)) return 10
  if (['4', '5', '6', '7'].includes(card.rank)) return 5
  // 3s cannot be melded normally
  return 5
}

// Game variant
export type Variant = '2p' | '3p' | '4p-partnership'

// Initial deal size per variant
export function dealSize(variant: Variant): number {
  if (variant === '2p') return 15
  if (variant === '4p-partnership') return 11
  return 13
}

// Partnership helpers — only meaningful when variant === '4p-partnership'
// Turn order: 0 → 1 → 2 → 3; teams: {0,2} vs {1,3}
export function teamIndex(playerIndex: number): number {
  return playerIndex % 2 // 0,2 → team 0; 1,3 → team 1
}

export function partnerIndex(playerIndex: number): number {
  return (playerIndex + 2) % 4
}

// Meld representation
export interface Meld {
  rank: Rank // the natural rank this meld is built on
  naturals: Card[] // natural cards in the meld
  wilds: Card[] // wild cards in the meld
}

// Canasta type
export type CanastaType = 'natural' | 'mixed' | null

// Pile state
export interface PileState {
  cards: Card[]
  frozen: boolean // true if a wild card has been discarded on it
  blockedOneTurn: boolean // true if top card is a black 3
}

// Player
export type PlayerType = 'human' | 'ai'

export interface Player {
  id: string
  name: string
  type: PlayerType
  hand: Card[]
  melds: Meld[]
  red3s: Card[] // face-up red 3s
  hasOpenedMelds: boolean // whether the player has placed their first meld
  score: number // running total across rounds
}

// Game state
export type GamePhase = 'deal' | 'draw' | 'meld' | 'discard' | 'end'

export interface GameState {
  variant: Variant
  players: Player[]
  currentPlayerIndex: number
  stock: Card[]
  pile: PileState
  phase: GamePhase
  roundScores: Record<string, number>[]
  matchOver: boolean
}

// Minimum initial meld requirement by running score
export function minimumMeldPoints(runningScore: number): number {
  if (runningScore < 0) return 15
  if (runningScore < 1500) return 50
  if (runningScore < 3000) return 90
  return 120
}

// Stats types
export interface GameRecord {
  id: string
  date: string // ISO 8601
  variant: Variant
  difficulty: AIDifficulty
  winner: 'human' | 'ai'
  scores: Record<string, number>
  rounds: number
  durationMs: number
}

export interface PlayerStats {
  gamesPlayed: number
  wins: number
  losses: number
  bestScore: number
  history: GameRecord[] // capped at last 100 games
}

export type AIDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'

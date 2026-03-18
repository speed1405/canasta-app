import type { Card, Meld, Player } from './types'
import { cardPointValue, isRed3 } from './types'
import { canastaBonus, meldTotalPoints } from './meld'

/**
 * Calculate the score for one player at the end of a round.
 *
 * Components:
 *   + sum of card values in completed melds
 *   + canasta bonuses (natural: 500, mixed: 300)
 *   + going-out bonus (100, or 200 if concealed)
 *   + red 3 bonuses (100 each, or 800 for all four; negated if player has no melds)
 *   - sum of card values remaining in hand
 *   - 5 pts per black 3 left in hand  (handled via cardPointValue — black 3s are 5 pts)
 */
export interface RoundScoreDetails {
  meldPoints: number
  canastaPoints: number
  goingOutBonus: number
  red3Points: number // positive or negative
  handPenalty: number
  total: number
}

export function calculateRoundScore(
  player: Player,
  {
    wentOut = false,
    wentOutConcealed = false,
    totalRed3Count = 0,
  }: {
    wentOut?: boolean
    wentOutConcealed?: boolean
    totalRed3Count?: number
  } = {},
): RoundScoreDetails {
  // Meld card values
  const meldPoints = player.melds.reduce(
    (sum, m) => sum + meldTotalPoints(m),
    0,
  )

  // Canasta bonuses
  const canastaPoints = player.melds.reduce(
    (sum, m) => sum + canastaBonus(m),
    0,
  )

  // Going-out bonus
  const goingOutBonus = wentOut
    ? wentOutConcealed
      ? 200
      : 100
    : 0

  // Red 3 bonuses/penalties
  const red3Count = player.red3s.filter(isRed3).length
  let red3Value: number
  if (red3Count === 0) {
    red3Value = 0
  } else if (red3Count === 4 && totalRed3Count === 4) {
    // Player holds all four — doubled
    red3Value = 800
  } else {
    red3Value = red3Count * 100
  }
  // If the player has not completed any meld, red 3s score against them
  const red3Points =
    player.hasOpenedMelds ? red3Value : -red3Value

  // Hand penalty — cards left in hand
  const handPenalty = player.hand.reduce(
    (sum, c) => sum + cardPointValue(c),
    0,
  )

  const total =
    meldPoints + canastaPoints + goingOutBonus + red3Points - handPenalty

  return {
    meldPoints,
    canastaPoints,
    goingOutBonus,
    red3Points,
    handPenalty,
    total,
  }
}

/**
 * Card point value table (for reference UI and scoring).
 */
export const CARD_POINT_VALUES: Record<string, number> = {
  Joker: 50,
  A: 20,
  '2': 20,
  K: 10,
  Q: 10,
  J: 10,
  '10': 10,
  '9': 10,
  '8': 10,
  '7': 5,
  '6': 5,
  '5': 5,
  '4': 5,
}

/**
 * Count the number of canastas a player has completed.
 */
export function countCanastas(melds: Meld[]): number {
  return melds.filter((m) => m.naturals.length + m.wilds.length >= 7).length
}

/**
 * Determine whether a player can legally go out.
 * A player may go out when they have at least one completed canasta AND
 * they can meld/discard their last card in a single turn.
 * (Full validation is done in rules.ts; this is a quick eligibility check.)
 */
export function canGoOut(player: Player): boolean {
  return countCanastas(player.melds) >= 1
}

/**
 * Score a red-3 held by a player (positive if they have opened melds,
 * negative otherwise).
 */
export function scoreRed3(card: Card, playerHasOpenedMelds: boolean): number {
  if (!isRed3(card)) return 0
  return playerHasOpenedMelds ? 100 : -100
}

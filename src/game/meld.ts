import type { Card, Meld, Rank, CanastaType } from './types'
import { cardPointValue, isWild } from './types'

/**
 * Validate whether a proposed meld (array of cards) is legal.
 *
 * Rules:
 * - At least 3 cards total.
 * - At least 2 natural cards (wilds may not form the majority).
 * - All natural cards must share the same rank.
 * - That rank must not be 3 (3s cannot be melded normally).
 * - Number of wilds ≤ number of naturals.
 */
export function isMeldValid(cards: Card[]): boolean {
  if (cards.length < 3) return false

  const naturals = cards.filter((c) => !isWild(c))
  const wilds = cards.filter((c) => isWild(c))

  if (naturals.length < 2) return false
  if (wilds.length > naturals.length) return false

  // All naturals must share the same rank and it must not be '3'
  const rank = naturals[0].rank
  if (rank === '3') return false
  if (!naturals.every((c) => c.rank === rank)) return false

  return true
}

/**
 * Return the natural rank for a set of cards that form a valid meld.
 * Returns null if the cards are not a valid meld.
 */
export function meldRank(cards: Card[]): Rank | null {
  if (!isMeldValid(cards)) return null
  const naturals = cards.filter((c) => !isWild(c))
  return naturals[0].rank
}

/**
 * Score the point value of a meld's cards (used to check minimum meld
 * requirement). Wild cards count at face value.
 */
export function meldPointValue(cards: Card[]): number {
  return cards.reduce((sum, c) => sum + cardPointValue(c), 0)
}

/**
 * Determine whether a meld (represented as Meld object) is a Canasta.
 * A Canasta requires at least 7 cards.
 */
export function isMeldCanasta(meld: Meld): boolean {
  return meld.naturals.length + meld.wilds.length >= 7
}

/**
 * Determine the Canasta type of a completed Canasta.
 * Returns null if not yet a Canasta.
 */
export function canastaType(meld: Meld): CanastaType {
  if (!isMeldCanasta(meld)) return null
  return meld.wilds.length === 0 ? 'natural' : 'mixed'
}

/**
 * Canasta bonus value.
 */
export function canastaBonus(meld: Meld): number {
  const type = canastaType(meld)
  if (type === 'natural') return 500
  if (type === 'mixed') return 300
  return 0
}

/**
 * Build a Meld object from an array of cards (assumes valid meld).
 */
export function buildMeld(cards: Card[]): Meld {
  const rank = meldRank(cards)!
  return {
    rank,
    naturals: cards.filter((c) => !isWild(c)),
    wilds: cards.filter((c) => isWild(c)),
  }
}

/**
 * Check whether adding a card to an existing meld is valid.
 * A card can be added if:
 * - It is a wild card, and wilds+1 ≤ naturals (wild limit not exceeded), OR
 * - It is a natural card matching the meld's rank.
 */
export function canAddToMeld(meld: Meld, card: Card): boolean {
  if (isWild(card)) {
    return meld.wilds.length + 1 <= meld.naturals.length
  }
  if (card.rank === meld.rank) {
    return true
  }
  return false
}

/**
 * Add a card to an existing meld (returns updated Meld, immutably).
 */
export function addToMeld(meld: Meld, card: Card): Meld {
  if (isWild(card)) {
    return { ...meld, wilds: [...meld.wilds, card] }
  }
  return { ...meld, naturals: [...meld.naturals, card] }
}

/**
 * Total point value of all cards in a meld (naturals + wilds).
 */
export function meldTotalPoints(meld: Meld): number {
  const cards = [...meld.naturals, ...meld.wilds]
  return cards.reduce((sum, c) => sum + cardPointValue(c), 0)
}

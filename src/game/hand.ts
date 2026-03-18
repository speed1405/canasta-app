import type { Card, Rank } from './types'
import { cardCategory, cardPointValue } from './types'

/**
 * Sort a hand: naturals grouped by rank (A first), then wilds, then 3s.
 */
export function sortHand(cards: Card[]): Card[] {
  const rankOrder: Rank[] = [
    'A',
    'K',
    'Q',
    'J',
    '10',
    '9',
    '8',
    '7',
    '6',
    '5',
    '4',
    '3',
    '2',
    'Joker',
  ]

  return [...cards].sort((a, b) => {
    // First sort by rank order
    const ai = rankOrder.indexOf(a.rank)
    const bi = rankOrder.indexOf(b.rank)
    if (ai !== bi) return ai - bi
    // Then by suit for stable sort
    const sa = a.suit ?? ''
    const sb = b.suit ?? ''
    return sa.localeCompare(sb)
  })
}

/**
 * Add cards to a hand (returns new array).
 */
export function addCards(hand: Card[], toAdd: Card[]): Card[] {
  return [...hand, ...toAdd]
}

/**
 * Remove a single card by id from a hand (returns new array).
 */
export function removeCard(hand: Card[], cardId: string): Card[] {
  return hand.filter((c) => c.id !== cardId)
}

/**
 * Remove multiple cards by id from a hand (returns new array).
 */
export function removeCards(hand: Card[], cardIds: string[]): Card[] {
  const set = new Set(cardIds)
  return hand.filter((c) => !set.has(c.id))
}

/**
 * Total point value of cards remaining in hand (used for penalty calculation).
 */
export function handPenalty(hand: Card[]): number {
  return hand.reduce((sum, c) => sum + cardPointValue(c), 0)
}

/**
 * Check whether a hand contains any natural cards (non-wild, non-3).
 */
export function hasNaturals(hand: Card[]): boolean {
  return hand.some((c) => cardCategory(c) === 'natural')
}

/**
 * Count how many cards of a given rank are in the hand.
 */
export function countRank(hand: Card[], rank: Rank): number {
  return hand.filter((c) => c.rank === rank).length
}

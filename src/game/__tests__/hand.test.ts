import { describe, it, expect } from 'vitest'
import type { Card } from '../types'
import {
  sortHand,
  addCards,
  removeCard,
  removeCards,
  handPenalty,
  hasNaturals,
  countRank,
} from '../hand'

const card = (rank: Card['rank'], suit: Card['suit'] = 'spades', idx = 0): Card => ({
  rank,
  suit,
  id: `${rank}-${suit ?? 'null'}-${idx}`,
})

const joker = (idx = 0): Card => ({ rank: 'Joker', suit: null, id: `Joker-null-${idx}` })

describe('sortHand', () => {
  it('does not mutate the input', () => {
    const hand = [card('5'), card('A'), card('K')]
    const original = [...hand]
    sortHand(hand)
    expect(hand).toEqual(original)
  })

  it('places A before K', () => {
    const hand = [card('K'), card('A')]
    const sorted = sortHand(hand)
    expect(sorted[0].rank).toBe('A')
    expect(sorted[1].rank).toBe('K')
  })

  it('places wilds (2, Joker) after naturals', () => {
    const hand = [joker(), card('2'), card('7')]
    const sorted = sortHand(hand)
    expect(sorted[0].rank).toBe('7')
  })
})

describe('addCards', () => {
  it('appends cards', () => {
    const hand = [card('A')]
    const result = addCards(hand, [card('K'), card('Q')])
    expect(result).toHaveLength(3)
  })

  it('does not mutate the original', () => {
    const hand = [card('A')]
    addCards(hand, [card('K')])
    expect(hand).toHaveLength(1)
  })
})

describe('removeCard', () => {
  it('removes the card with the given id', () => {
    const h = [card('A', 'spades', 0), card('K', 'spades', 1)]
    const result = removeCard(h, 'A-spades-0')
    expect(result).toHaveLength(1)
    expect(result[0].rank).toBe('K')
  })

  it('returns the same array if id not found', () => {
    const h = [card('A')]
    const result = removeCard(h, 'nonexistent')
    expect(result).toHaveLength(1)
  })
})

describe('removeCards', () => {
  it('removes multiple cards by id', () => {
    const h = [card('A', 'spades', 0), card('K', 'spades', 1), card('Q', 'spades', 2)]
    const result = removeCards(h, ['A-spades-0', 'Q-spades-2'])
    expect(result).toHaveLength(1)
    expect(result[0].rank).toBe('K')
  })
})

describe('handPenalty', () => {
  it('sums card point values', () => {
    const h = [card('A'), card('K'), joker()]
    // A=20, K=10, Joker=50
    expect(handPenalty(h)).toBe(80)
  })

  it('returns 0 for empty hand', () => {
    expect(handPenalty([])).toBe(0)
  })
})

describe('hasNaturals', () => {
  it('returns true when hand contains naturals', () => {
    expect(hasNaturals([card('7')])).toBe(true)
  })

  it('returns false for all-wild hand', () => {
    expect(hasNaturals([joker(), card('2')])).toBe(false)
  })

  it('returns false for empty hand', () => {
    expect(hasNaturals([])).toBe(false)
  })
})

describe('countRank', () => {
  it('counts correctly', () => {
    const h = [card('A'), card('A'), card('K')]
    expect(countRank(h, 'A')).toBe(2)
    expect(countRank(h, 'Q')).toBe(0)
  })
})

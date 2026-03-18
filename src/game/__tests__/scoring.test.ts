import { describe, it, expect } from 'vitest'
import type { Card, Meld, Player } from '../types'
import {
  calculateRoundScore,
  countCanastas,
  canGoOut,
  CARD_POINT_VALUES,
} from '../scoring'

const natural = (rank: Card['rank'], idx = 0): Card => ({
  rank,
  suit: 'spades',
  id: `${rank}-spades-${idx}`,
})

const red3 = (idx = 0): Card => ({
  rank: '3',
  suit: 'hearts',
  id: `3-hearts-${idx}`,
})

const wild = (idx = 0): Card => ({
  rank: '2',
  suit: 'hearts',
  id: `2-hearts-${idx}`,
})

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'human',
    name: 'Human',
    type: 'human',
    hand: [],
    melds: [],
    red3s: [],
    hasOpenedMelds: false,
    score: 0,
    ...overrides,
  }
}

const naturalCanasta: Meld = {
  rank: 'K',
  naturals: Array.from({ length: 7 }, (_, i) => natural('K', i)),
  wilds: [],
}

const mixedCanasta: Meld = {
  rank: 'Q',
  naturals: Array.from({ length: 6 }, (_, i) => natural('Q', i)),
  wilds: [wild(0)],
}

describe('calculateRoundScore', () => {
  it('returns zero for player with no melds or cards', () => {
    const player = makePlayer()
    const result = calculateRoundScore(player)
    expect(result.total).toBe(0)
  })

  it('adds going-out bonus of 100', () => {
    const player = makePlayer({ melds: [naturalCanasta], hasOpenedMelds: true })
    const result = calculateRoundScore(player, { wentOut: true })
    expect(result.goingOutBonus).toBe(100)
  })

  it('adds concealed going-out bonus of 200', () => {
    const player = makePlayer({ melds: [naturalCanasta], hasOpenedMelds: true })
    const result = calculateRoundScore(player, {
      wentOut: true,
      wentOutConcealed: true,
    })
    expect(result.goingOutBonus).toBe(200)
  })

  it('adds canasta bonus for natural canasta (500)', () => {
    const player = makePlayer({ melds: [naturalCanasta], hasOpenedMelds: true })
    const result = calculateRoundScore(player)
    expect(result.canastaPoints).toBe(500)
  })

  it('adds canasta bonus for mixed canasta (300)', () => {
    const player = makePlayer({ melds: [mixedCanasta], hasOpenedMelds: true })
    const result = calculateRoundScore(player)
    expect(result.canastaPoints).toBe(300)
  })

  it('adds red3 bonus when player has opened melds', () => {
    const player = makePlayer({
      melds: [naturalCanasta],
      hasOpenedMelds: true,
      red3s: [red3(0)],
    })
    const result = calculateRoundScore(player)
    expect(result.red3Points).toBe(100)
  })

  it('subtracts red3 penalty when player has not opened melds', () => {
    const player = makePlayer({
      hasOpenedMelds: false,
      red3s: [red3(0)],
    })
    const result = calculateRoundScore(player)
    expect(result.red3Points).toBe(-100)
  })

  it('doubles red3 bonus when player holds all four', () => {
    const player = makePlayer({
      melds: [naturalCanasta],
      hasOpenedMelds: true,
      red3s: [red3(0), red3(1), red3(2), red3(3)],
    })
    const result = calculateRoundScore(player, { totalRed3Count: 4 })
    expect(result.red3Points).toBe(800)
  })

  it('subtracts hand penalty', () => {
    const player = makePlayer({
      hand: [natural('K', 0), natural('K', 1)], // 2 × 10 = 20
    })
    const result = calculateRoundScore(player)
    expect(result.handPenalty).toBe(20)
  })

  it('combines all components correctly', () => {
    const player = makePlayer({
      melds: [naturalCanasta], // 7 × K (10 pts) = 70 meld pts + 500 canasta bonus
      hasOpenedMelds: true,
      hand: [natural('A', 0)], // 20 pts hand penalty
    })
    const result = calculateRoundScore(player, { wentOut: true })
    expect(result.meldPoints).toBe(70)
    expect(result.canastaPoints).toBe(500)
    expect(result.goingOutBonus).toBe(100)
    expect(result.handPenalty).toBe(20)
    expect(result.total).toBe(70 + 500 + 100 - 20)
  })
})

describe('CARD_POINT_VALUES', () => {
  it('has correct values', () => {
    expect(CARD_POINT_VALUES['Joker']).toBe(50)
    expect(CARD_POINT_VALUES['A']).toBe(20)
    expect(CARD_POINT_VALUES['2']).toBe(20)
    expect(CARD_POINT_VALUES['K']).toBe(10)
    expect(CARD_POINT_VALUES['7']).toBe(5)
  })
})

describe('countCanastas', () => {
  it('returns 0 for no melds', () => {
    expect(countCanastas([])).toBe(0)
  })

  it('counts completed canastas', () => {
    expect(countCanastas([naturalCanasta, mixedCanasta])).toBe(2)
  })

  it('does not count incomplete melds', () => {
    const shortMeld: Meld = {
      rank: 'A',
      naturals: [natural('A', 0), natural('A', 1)],
      wilds: [wild(0)],
    }
    expect(countCanastas([shortMeld])).toBe(0)
  })
})

describe('canGoOut', () => {
  it('returns false when no canasta completed', () => {
    const player = makePlayer()
    expect(canGoOut(player)).toBe(false)
  })

  it('returns true when at least one canasta completed', () => {
    const player = makePlayer({ melds: [naturalCanasta] })
    expect(canGoOut(player)).toBe(true)
  })
})

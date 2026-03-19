import { describe, it, expect } from 'vitest'
import { expectedScore, updateElo, DEFAULT_ELO } from '../eloService'

describe('Elo math', () => {
  it('expectedScore returns 0.5 for equal ratings', () => {
    expect(expectedScore(1200, 1200)).toBeCloseTo(0.5)
  })

  it('expectedScore favours higher-rated player', () => {
    expect(expectedScore(1400, 1200)).toBeGreaterThan(0.5)
    expect(expectedScore(1000, 1200)).toBeLessThan(0.5)
  })

  it('DEFAULT_ELO is 1200', () => {
    expect(DEFAULT_ELO).toBe(1200)
  })

  it('updateElo — winner gains, loser loses equal amount', () => {
    const [newA, newB] = updateElo(1200, 1200, 1)
    expect(newA).toBeGreaterThan(1200)
    expect(newB).toBeLessThan(1200)
    expect(newA + newB).toBe(2400) // zero-sum
  })

  it('updateElo — higher-rated winner gains less', () => {
    const [gainHigh] = updateElo(1500, 1200, 1)
    const [gainLow] = updateElo(1200, 1500, 1)
    expect(gainLow - 1200).toBeGreaterThan(gainHigh - 1500)
  })

  it('updateElo — a loss decreases rating', () => {
    const [newA] = updateElo(1200, 1200, 0)
    expect(newA).toBeLessThan(1200)
  })

  it('updateElo — draw keeps ratings close to original', () => {
    const [newA, newB] = updateElo(1200, 1200, 0.5)
    expect(newA).toBe(1200)
    expect(newB).toBe(1200)
  })
})

import { describe, it, expect } from 'vitest'
import type { Card, Meld, PileState, Player } from '../types'
import {
  validateDrawFromStock,
  validatePickUpPile,
  validateNewMeld,
  validateAddToMeld,
  validateDiscard,
  validateGoOut,
  isConcealed,
} from '../rules'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const natural = (rank: Card['rank'], idx = 0): Card => ({
  rank,
  suit: 'spades',
  id: `${rank}-spades-${idx}`,
})

const wild = (idx = 0): Card => ({
  rank: '2',
  suit: 'hearts',
  id: `2-hearts-${idx}`,
})

const joker = (): Card => ({ rank: 'Joker', suit: null, id: 'Joker-null-0' })
void joker // suppress unused warning in non-test build

const red3 = (idx = 0): Card => ({
  rank: '3',
  suit: 'hearts',
  id: `3-hearts-${idx}`,
})

const black3 = (idx = 0): Card => ({
  rank: '3',
  suit: 'spades',
  id: `3-spades-${idx}`,
})

function makePile(overrides: Partial<PileState> = {}): PileState {
  return { cards: [], frozen: false, blockedOneTurn: false, ...overrides }
}

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

// ─── validateDrawFromStock ────────────────────────────────────────────────────

describe('validateDrawFromStock', () => {
  it('ok when stock has cards', () => {
    expect(validateDrawFromStock([natural('K')])).toEqual({ ok: true })
  })

  it('fails when stock is empty', () => {
    const result = validateDrawFromStock([])
    expect(result.ok).toBe(false)
  })
})

// ─── validatePickUpPile ───────────────────────────────────────────────────────

describe('validatePickUpPile', () => {
  it('fails when pile is empty', () => {
    expect(validatePickUpPile(makePile(), [], []).ok).toBe(false)
  })

  it('fails when pile is blocked', () => {
    const pile = makePile({
      cards: [black3()],
      blockedOneTurn: true,
    })
    expect(validatePickUpPile(pile, [], []).ok).toBe(false)
  })

  it('fails when frozen and player lacks two matching naturals', () => {
    const pile = makePile({
      cards: [natural('K')],
      frozen: true,
    })
    const hand = [natural('K', 1)] // only one
    expect(validatePickUpPile(pile, hand, []).ok).toBe(false)
  })

  it('ok when frozen and player holds two matching naturals', () => {
    const pile = makePile({
      cards: [natural('K', 0)],
      frozen: true,
    })
    const hand = [natural('K', 1), natural('K', 2)]
    expect(validatePickUpPile(pile, hand, []).ok).toBe(true)
  })

  it('ok when not frozen and player has existing meld of that rank', () => {
    const pile = makePile({ cards: [natural('K', 0)] })
    const meld: Meld = {
      rank: 'K',
      naturals: [natural('K', 1), natural('K', 2), natural('K', 3)],
      wilds: [],
    }
    expect(validatePickUpPile(pile, [], [meld]).ok).toBe(true)
  })

  it('ok when not frozen and player can form new meld from hand', () => {
    const pile = makePile({ cards: [natural('K', 0)] })
    const hand = [natural('K', 1), natural('K', 2)]
    expect(validatePickUpPile(pile, hand, []).ok).toBe(true)
  })

  it('ok when not frozen with one natural + one wild in hand', () => {
    const pile = makePile({ cards: [natural('K', 0)] })
    const hand = [natural('K', 1), wild(0)]
    expect(validatePickUpPile(pile, hand, []).ok).toBe(true)
  })

  it('fails when not frozen and player cannot use top card', () => {
    const pile = makePile({ cards: [natural('K', 0)] })
    const hand = [natural('Q', 0), natural('J', 0)]
    expect(validatePickUpPile(pile, hand, []).ok).toBe(false)
  })

  it('fails when top card is a red 3', () => {
    const pile = makePile({ cards: [red3()] })
    expect(validatePickUpPile(pile, [natural('K')], []).ok).toBe(false)
  })
})

// ─── validateNewMeld ──────────────────────────────────────────────────────────

describe('validateNewMeld', () => {
  const playerNoMelds = makePlayer({ score: 0, hasOpenedMelds: false })
  const playerWithMelds = makePlayer({ score: 0, hasOpenedMelds: true })

  it('fails for invalid meld', () => {
    const result = validateNewMeld([natural('K')], playerNoMelds, '2p')
    expect(result.ok).toBe(false)
  })

  it('fails when initial meld does not meet minimum (50 pts at score 0)', () => {
    // 3 × 7 (5 pts each) = 15 pts — below 50
    const cards = [natural('7', 0), natural('7', 1), natural('7', 2)]
    expect(validateNewMeld(cards, playerNoMelds, '2p').ok).toBe(false)
  })

  it('ok when initial meld meets minimum', () => {
    // 3 × A (20 pts each) = 60 pts ≥ 50
    const cards = [natural('A', 0), natural('A', 1), natural('A', 2)]
    expect(validateNewMeld(cards, playerNoMelds, '2p').ok).toBe(true)
  })

  it('ok for subsequent meld regardless of points', () => {
    const cards = [natural('7', 0), natural('7', 1), natural('7', 2)]
    expect(validateNewMeld(cards, playerWithMelds, '2p').ok).toBe(true)
  })

  it('requires 120 pts when score ≥ 3000', () => {
    const highScorePlayer = makePlayer({ score: 3000, hasOpenedMelds: false })
    // 3 × K (10 pts) = 30 pts — below 120
    const cards = [natural('K', 0), natural('K', 1), natural('K', 2)]
    expect(validateNewMeld(cards, highScorePlayer, '2p').ok).toBe(false)
  })
})

// ─── validateAddToMeld ────────────────────────────────────────────────────────

describe('validateAddToMeld', () => {
  const meld: Meld = {
    rank: 'K',
    naturals: [natural('K', 0), natural('K', 1), natural('K', 2)],
    wilds: [],
  }

  it('ok when adding matching natural', () => {
    expect(validateAddToMeld([natural('K', 3)], meld).ok).toBe(true)
  })

  it('ok when adding wild', () => {
    expect(validateAddToMeld([wild(0)], meld).ok).toBe(true)
  })

  it('fails when adding non-matching card', () => {
    expect(validateAddToMeld([natural('Q', 0)], meld).ok).toBe(false)
  })
})

// ─── validateDiscard ─────────────────────────────────────────────────────────

describe('validateDiscard', () => {
  it('ok for natural card', () => {
    expect(validateDiscard(natural('K')).ok).toBe(true)
  })

  it('ok for wild card', () => {
    expect(validateDiscard(wild()).ok).toBe(true)
  })

  it('fails for red 3', () => {
    expect(validateDiscard(red3()).ok).toBe(false)
  })

  it('ok for black 3', () => {
    expect(validateDiscard(black3()).ok).toBe(true)
  })
})

// ─── validateGoOut ────────────────────────────────────────────────────────────

describe('validateGoOut', () => {
  it('fails when no canasta', () => {
    const player = makePlayer({ melds: [] })
    expect(validateGoOut(player).ok).toBe(false)
  })

  it('ok when player has at least one canasta', () => {
    const player = makePlayer({ melds: [naturalCanasta] })
    expect(validateGoOut(player).ok).toBe(true)
  })
})

// ─── isConcealed ─────────────────────────────────────────────────────────────

describe('isConcealed', () => {
  it('returns true when player has not previously melded', () => {
    expect(isConcealed(makePlayer({ hasOpenedMelds: false }))).toBe(true)
  })

  it('returns false when player has previously melded', () => {
    expect(isConcealed(makePlayer({ hasOpenedMelds: true }))).toBe(false)
  })
})

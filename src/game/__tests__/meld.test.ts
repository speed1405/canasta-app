import { describe, it, expect } from 'vitest'
import type { Card, Meld } from '../types'
import {
  isMeldValid,
  meldRank,
  meldPointValue,
  isMeldCanasta,
  canastaType,
  canastaBonus,
  buildMeld,
  canAddToMeld,
  addToMeld,
  meldTotalPoints,
} from '../meld'

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

const joker = (idx = 0): Card => ({
  rank: 'Joker',
  suit: null,
  id: `Joker-null-${idx}`,
})
void joker // suppress unused warning in non-test build

describe('isMeldValid', () => {
  it('accepts a simple 3-natural meld', () => {
    expect(isMeldValid([natural('K', 0), natural('K', 1), natural('K', 2)])).toBe(true)
  })

  it('accepts a meld with one wild', () => {
    expect(
      isMeldValid([natural('Q', 0), natural('Q', 1), wild(0)]),
    ).toBe(true)
  })

  it('rejects a meld with fewer than 3 cards', () => {
    expect(isMeldValid([natural('K', 0), natural('K', 1)])).toBe(false)
  })

  it('rejects a meld with only one natural', () => {
    expect(isMeldValid([natural('K', 0), wild(0), wild(1)])).toBe(false)
  })

  it('rejects when wilds exceed naturals', () => {
    // 2 naturals, 3 wilds → wilds > naturals
    expect(
      isMeldValid([natural('K', 0), natural('K', 1), wild(0), wild(1), wild(2)]),
    ).toBe(false)
  })

  it('rejects mixed ranks', () => {
    expect(isMeldValid([natural('K', 0), natural('Q', 0), natural('J', 0)])).toBe(false)
  })

  it('rejects rank 3 as meld base', () => {
    const three = { rank: '3' as Card['rank'], suit: 'spades' as Card['suit'], id: '3-s-0' }
    expect(isMeldValid([three, three, three])).toBe(false)
  })
})

describe('meldRank', () => {
  it('returns the natural rank', () => {
    const cards = [natural('7', 0), natural('7', 1), natural('7', 2)]
    expect(meldRank(cards)).toBe('7')
  })

  it('returns null for invalid meld', () => {
    expect(meldRank([natural('7', 0)])).toBeNull()
  })
})

describe('meldPointValue', () => {
  it('sums card values', () => {
    // 3 × K (10 pts each) = 30
    const cards = [natural('K', 0), natural('K', 1), natural('K', 2)]
    expect(meldPointValue(cards)).toBe(30)
  })

  it('includes wild card values', () => {
    // 2 × K (10) + 1 × 2 (20) = 40
    const cards = [natural('K', 0), natural('K', 1), wild(0)]
    expect(meldPointValue(cards)).toBe(40)
  })
})

describe('isMeldCanasta', () => {
  it('returns false for meld with 6 cards', () => {
    const meld: Meld = {
      rank: 'K',
      naturals: Array.from({ length: 6 }, (_, i) => natural('K', i)),
      wilds: [],
    }
    expect(isMeldCanasta(meld)).toBe(false)
  })

  it('returns true for meld with 7 cards', () => {
    const meld: Meld = {
      rank: 'K',
      naturals: Array.from({ length: 7 }, (_, i) => natural('K', i)),
      wilds: [],
    }
    expect(isMeldCanasta(meld)).toBe(true)
  })
})

describe('canastaType', () => {
  it('returns natural for no-wild canasta', () => {
    const meld: Meld = {
      rank: 'K',
      naturals: Array.from({ length: 7 }, (_, i) => natural('K', i)),
      wilds: [],
    }
    expect(canastaType(meld)).toBe('natural')
  })

  it('returns mixed when wilds are present', () => {
    const meld: Meld = {
      rank: 'K',
      naturals: Array.from({ length: 6 }, (_, i) => natural('K', i)),
      wilds: [wild(0)],
    }
    expect(canastaType(meld)).toBe('mixed')
  })

  it('returns null for non-canasta meld', () => {
    const meld: Meld = {
      rank: 'K',
      naturals: [natural('K', 0), natural('K', 1), natural('K', 2)],
      wilds: [],
    }
    expect(canastaType(meld)).toBeNull()
  })
})

describe('canastaBonus', () => {
  it('returns 500 for natural canasta', () => {
    const meld: Meld = {
      rank: 'K',
      naturals: Array.from({ length: 7 }, (_, i) => natural('K', i)),
      wilds: [],
    }
    expect(canastaBonus(meld)).toBe(500)
  })

  it('returns 300 for mixed canasta', () => {
    const meld: Meld = {
      rank: 'K',
      naturals: Array.from({ length: 6 }, (_, i) => natural('K', i)),
      wilds: [wild(0)],
    }
    expect(canastaBonus(meld)).toBe(300)
  })

  it('returns 0 for non-canasta', () => {
    const meld: Meld = {
      rank: 'K',
      naturals: [natural('K', 0), natural('K', 1)],
      wilds: [wild(0)],
    }
    expect(canastaBonus(meld)).toBe(0)
  })
})

describe('buildMeld', () => {
  it('separates naturals and wilds', () => {
    const cards = [natural('7', 0), natural('7', 1), wild(0)]
    const meld = buildMeld(cards)
    expect(meld.rank).toBe('7')
    expect(meld.naturals).toHaveLength(2)
    expect(meld.wilds).toHaveLength(1)
  })
})

describe('canAddToMeld', () => {
  const baseMeld: Meld = {
    rank: 'K',
    naturals: [natural('K', 0), natural('K', 1), natural('K', 2)],
    wilds: [],
  }

  it('allows adding a matching natural', () => {
    expect(canAddToMeld(baseMeld, natural('K', 3))).toBe(true)
  })

  it('allows adding a wild when limit not exceeded', () => {
    expect(canAddToMeld(baseMeld, wild(0))).toBe(true)
  })

  it('rejects adding a non-matching natural', () => {
    expect(canAddToMeld(baseMeld, natural('Q', 0))).toBe(false)
  })

  it('rejects adding a wild that would exceed limit', () => {
    const meldWithMaxWilds: Meld = {
      rank: 'K',
      naturals: [natural('K', 0), natural('K', 1)],
      wilds: [wild(0), wild(1)],
    }
    expect(canAddToMeld(meldWithMaxWilds, wild(2))).toBe(false)
  })
})

describe('addToMeld', () => {
  it('adds a natural card', () => {
    const meld: Meld = {
      rank: 'K',
      naturals: [natural('K', 0), natural('K', 1)],
      wilds: [],
    }
    const updated = addToMeld(meld, natural('K', 2))
    expect(updated.naturals).toHaveLength(3)
    expect(updated.wilds).toHaveLength(0)
  })

  it('adds a wild card', () => {
    const meld: Meld = {
      rank: 'K',
      naturals: [natural('K', 0), natural('K', 1), natural('K', 2)],
      wilds: [],
    }
    const updated = addToMeld(meld, wild(0))
    expect(updated.wilds).toHaveLength(1)
  })
})

describe('meldTotalPoints', () => {
  it('sums naturals and wilds', () => {
    const meld: Meld = {
      rank: 'K',
      naturals: [natural('K', 0)], // 10 pts
      wilds: [wild(0)], // 20 pts
    }
    expect(meldTotalPoints(meld)).toBe(30)
  })
})

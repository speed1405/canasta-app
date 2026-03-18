import { describe, it, expect } from 'vitest'
import type { Card, Meld, Player } from '../types'
import { teamIndex, partnerIndex } from '../types'
import { initGame, applyAddToMeld, applyEndRound } from '../gameEngine'
import { canGoOut, calculatePartnershipTeamScore } from '../scoring'
import { validatePickUpPile, validateNewMeld } from '../rules'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const natural = (rank: Card['rank'], suit: Card['suit'] = 'spades', idx = 0): Card => ({
  rank,
  suit,
  id: `${rank}-${suit}-${idx}`,
})

function makePlayer(id: string, overrides: Partial<Player> = {}): Player {
  return {
    id,
    name: id,
    type: id === 'human' ? 'human' : 'ai',
    hand: [],
    melds: [],
    red3s: [],
    hasOpenedMelds: false,
    score: 0,
    ...overrides,
  }
}

function makeCanasta(rank: Card['rank']): Meld {
  return {
    rank,
    naturals: Array.from({ length: 7 }, (_, i) => natural(rank, 'spades', i)),
    wilds: [],
  }
}

// ─── teamIndex & partnerIndex helpers ─────────────────────────────────────────

describe('teamIndex', () => {
  it('assigns players 0 and 2 to team 0', () => {
    expect(teamIndex(0)).toBe(0)
    expect(teamIndex(2)).toBe(0)
  })

  it('assigns players 1 and 3 to team 1', () => {
    expect(teamIndex(1)).toBe(1)
    expect(teamIndex(3)).toBe(1)
  })
})

describe('partnerIndex', () => {
  it('returns correct partner indices', () => {
    expect(partnerIndex(0)).toBe(2)
    expect(partnerIndex(1)).toBe(3)
    expect(partnerIndex(2)).toBe(0)
    expect(partnerIndex(3)).toBe(1)
  })
})

// ─── initGame 4p-partnership ──────────────────────────────────────────────────

describe('initGame 4p-partnership', () => {
  it('creates 4 players', () => {
    const { state } = initGame('4p-partnership', 'easy', 4)
    expect(state.players).toHaveLength(4)
  })

  it('deals 11 cards per player (adjusting for red 3s)', () => {
    const { state } = initGame('4p-partnership', 'easy', 4)
    // Red 3s are auto-placed and replaced from stock; each player's hand = 11
    state.players.forEach(p => {
      expect(p.hand.length).toBe(11)
    })
  })

  it('labels player 2 as Partner', () => {
    const { state } = initGame('4p-partnership', 'easy', 4)
    expect(state.players[2].name).toBe('Partner')
  })

  it('labels players 1 and 3 as Opponents', () => {
    const { state } = initGame('4p-partnership', 'easy', 4)
    expect(state.players[1].name).toContain('Opponent')
    expect(state.players[3].name).toContain('Opponent')
  })

  it('starts in draw phase', () => {
    const { state } = initGame('4p-partnership', 'easy', 4)
    expect(state.phase).toBe('draw')
  })

  it('uses 4p-partnership variant', () => {
    const { state } = initGame('4p-partnership', 'easy', 4)
    expect(state.variant).toBe('4p-partnership')
  })
})

// ─── canGoOut (partnership) ───────────────────────────────────────────────────

describe('canGoOut partnership', () => {
  it('requires 2 team canastas combined to go out', () => {
    const player = makePlayer('human', { melds: [makeCanasta('A')] })
    const partner = makePlayer('ai-2', { melds: [makeCanasta('K')] })
    // Team has 2 canastas total → can go out
    expect(canGoOut(player, partner.melds)).toBe(true)
  })

  it('cannot go out with only 1 team canasta', () => {
    const player = makePlayer('human', { melds: [makeCanasta('A')] })
    const partner = makePlayer('ai-2', { melds: [] })
    // Team has 1 canasta → cannot go out
    expect(canGoOut(player, partner.melds)).toBe(false)
  })

  it('can go out if player alone has 2 canastas', () => {
    const player = makePlayer('human', { melds: [makeCanasta('A'), makeCanasta('K')] })
    const partner = makePlayer('ai-2', { melds: [] })
    expect(canGoOut(player, partner.melds)).toBe(true)
  })

  it('cannot go out with 0 team canastas', () => {
    const player = makePlayer('human', { melds: [] })
    const partner = makePlayer('ai-2', { melds: [] })
    expect(canGoOut(player, partner.melds)).toBe(false)
  })
})

// ─── validatePickUpPile (partnership: considers partner melds) ────────────────

describe('validatePickUpPile partnership', () => {
  const makePile = (topRank: Card['rank'] = 'A') => ({
    cards: [natural(topRank, 'hearts', 0)],
    frozen: false,
    blockedOneTurn: false,
  })

  it('allows pickup when partner has existing meld of top rank', () => {
    const pile = makePile('A')
    const playerHand: Card[] = [natural('K')]
    const playerMelds: Meld[] = []
    const partnerMelds: Meld[] = [{ rank: 'A', naturals: [natural('A', 'spades', 1), natural('A', 'clubs', 1), natural('A', 'diamonds', 1)], wilds: [] }]
    const result = validatePickUpPile(pile, playerHand, playerMelds, partnerMelds)
    expect(result.ok).toBe(true)
  })

  it('denies pickup when neither player nor partner has matching meld and hand lacks naturals', () => {
    const pile = makePile('A')
    const playerHand: Card[] = [natural('K')]
    const playerMelds: Meld[] = []
    const partnerMelds: Meld[] = []
    const result = validatePickUpPile(pile, playerHand, playerMelds, partnerMelds)
    expect(result.ok).toBe(false)
  })
})

// ─── validateNewMeld (partnership: partner's hasOpenedMelds waives minimum) ───

describe('validateNewMeld partnership', () => {
  it('waives minimum meld requirement if partner has already opened', () => {
    const player = makePlayer('human', { score: 0, hasOpenedMelds: false })
    // 3 × 4s = 15 pts, which is the minimum for score < 1500
    const cards = [natural('4', 'spades', 0), natural('4', 'hearts', 0), natural('4', 'clubs', 0)]
    // Without partner open: needs ≥50 pts (score 0 threshold is 50)
    const withoutPartner = validateNewMeld(cards, player, '4p-partnership', false)
    expect(withoutPartner.ok).toBe(false)
    // With partner open: no minimum needed
    const withPartner = validateNewMeld(cards, player, '4p-partnership', true)
    expect(withPartner.ok).toBe(true)
  })
})

// ─── applyAddToMeld (partnership: add to partner's meld) ─────────────────────

describe('applyAddToMeld partnership', () => {
  it('allows current player to add cards to partner\'s meld', () => {
    const { state } = initGame('4p-partnership', 'easy', 4)
    const aceCard = natural('A', 'spades', 99)
    const partnerMeld: Meld = { rank: 'A', naturals: [natural('A', 'hearts', 1), natural('A', 'clubs', 1), natural('A', 'diamonds', 1)], wilds: [] }

    const players = state.players.map((p, i) => {
      if (i === 0) return { ...p, hand: [aceCard, ...p.hand], melds: [], hasOpenedMelds: false }
      if (i === 2) return { ...p, melds: [partnerMeld], hasOpenedMelds: true }
      return p
    })
    const meldState = { ...state, phase: 'meld' as const, currentPlayerIndex: 0, players }

    // Player 0 (human) adds to partner's (player 2) meld
    const result = applyAddToMeld(meldState, 'ai-2', [aceCard.id], 0)
    expect(result).not.toBe(meldState)
    // Partner's meld should now have 4 naturals
    expect(result.players[2].melds[0].naturals).toHaveLength(4)
    // Human's hand should have the ace removed
    expect(result.players[0].hand.find(c => c.id === aceCard.id)).toBeUndefined()
  })

  it('rejects adding to an opponent\'s meld in partnership', () => {
    const { state } = initGame('4p-partnership', 'easy', 4)
    const aceCard = natural('A', 'spades', 99)
    const opponentMeld: Meld = { rank: 'A', naturals: [natural('A', 'hearts', 1), natural('A', 'clubs', 1), natural('A', 'diamonds', 1)], wilds: [] }

    const players = state.players.map((p, i) => {
      if (i === 0) return { ...p, hand: [aceCard, ...p.hand] }
      if (i === 1) return { ...p, melds: [opponentMeld], hasOpenedMelds: true } // opponent
      return p
    })
    const meldState = { ...state, phase: 'meld' as const, currentPlayerIndex: 0, players }

    // Player 0 cannot add to opponent (player 1)'s meld
    const result = applyAddToMeld(meldState, 'ai-1', [aceCard.id], 0)
    expect(result).toBe(meldState) // unchanged
  })
})

// ─── applyEndRound (partnership team scoring) ─────────────────────────────────

describe('applyEndRound partnership', () => {
  it('applies team score to both partners equally', () => {
    const { state } = initGame('4p-partnership', 'easy', 4)

    // Give team 0 (players 0 + 2) a natural canasta each
    const canasta0 = makeCanasta('A')
    const canasta2 = makeCanasta('K')
    const players = state.players.map((p, i) => {
      if (i === 0) return { ...p, hand: [], melds: [canasta0], hasOpenedMelds: true }
      if (i === 2) return { ...p, hand: [], melds: [canasta2], hasOpenedMelds: true }
      return { ...p, hand: [] }
    })
    const endState = { ...state, players, phase: 'end' as const, currentPlayerIndex: 0 }

    const result = applyEndRound(endState, 'human')
    // Both team 0 members should have the same score
    expect(result.players[0].score).toBe(result.players[2].score)
    // Score should be positive (canastas > penalties)
    expect(result.players[0].score).toBeGreaterThan(0)
  })

  it('team 1 scores independently from team 0', () => {
    const { state } = initGame('4p-partnership', 'easy', 4)

    // Team 0 has canastas, team 1 does not
    const canasta = makeCanasta('A')
    const players = state.players.map((p, i) => {
      if (i === 0) return { ...p, hand: [], melds: [canasta, canasta], hasOpenedMelds: true }
      if (i === 2) return { ...p, hand: [], melds: [], hasOpenedMelds: false }
      return { ...p, hand: [] }
    })
    const endState = { ...state, players, phase: 'end' as const, currentPlayerIndex: 0 }
    const result = applyEndRound(endState, 'human')

    // Team 0 score != Team 1 score (team 0 has canastas)
    expect(result.players[0].score).not.toBe(result.players[1].score)
  })
})

// ─── calculatePartnershipTeamScore ────────────────────────────────────────────

describe('calculatePartnershipTeamScore', () => {
  it('combines melds from both partners', () => {
    const canasta0 = makeCanasta('A') // 500 bonus + 20*7 = 640
    const canasta2 = makeCanasta('K') // 500 bonus + 10*7 = 570
    const p0 = makePlayer('human', { melds: [canasta0], hasOpenedMelds: true })
    const p2 = makePlayer('ai-2', { melds: [canasta2], hasOpenedMelds: true })

    const result = calculatePartnershipTeamScore(p0, p2, {})
    // meldPoints = 140 (A*7) + 70 (K*7) = 210
    // canastaPoints = 500 + 500 = 1000
    expect(result.meldPoints).toBe(210)
    expect(result.canastaPoints).toBe(1000)
    expect(result.total).toBe(1210)
  })

  it('awards going-out bonus to correct team', () => {
    const p0 = makePlayer('human', { hand: [], melds: [makeCanasta('A'), makeCanasta('K')], hasOpenedMelds: true })
    const p2 = makePlayer('ai-2', { melds: [], hasOpenedMelds: false })

    const result = calculatePartnershipTeamScore(p0, p2, { goingOutPlayerId: 'human' })
    expect(result.goingOutBonus).toBe(100)
  })

  it('negates red 3 value if team has not opened melds', () => {
    const red3: Card = { rank: '3', suit: 'hearts', id: '3-hearts-0' }
    const p0 = makePlayer('human', { red3s: [red3], hasOpenedMelds: false })
    const p2 = makePlayer('ai-2', { hasOpenedMelds: false })

    const result = calculatePartnershipTeamScore(p0, p2, {})
    expect(result.red3Points).toBe(-100)
  })
})

import { describe, it, expect } from 'vitest'
import {
  initGame,
  applyDrawFromStock,
  applyPickUpPile,
  applyPlaceMeld,
  applyAddToMeld,
  applyDiscard,
  applyEndRound,
  getHint,
} from '../gameEngine'
import { buildMeld } from '../meld'
import type { Card, Meld } from '../types'

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeCard(rank: string, suit: string, idx = 0): Card {
  return { rank, suit, id: `${rank}-${suit}-${idx}` } as Card
}

// ─── initGame ─────────────────────────────────────────────────────────────────

describe('initGame', () => {
  it('creates 2 players for 2p variant', () => {
    const { state } = initGame('2p', 'easy', 2)
    expect(state.players).toHaveLength(2)
    expect(state.players[0].id).toBe('human')
    expect(state.players[1].id).toBe('ai-1')
    expect(state.players[1].type).toBe('ai')
  })

  it('creates 3 players for 3p variant', () => {
    const { state } = initGame('3p', 'easy', 3)
    expect(state.players).toHaveLength(3)
    expect(state.players[0].id).toBe('human')
    expect(state.players[1].id).toBe('ai-1')
    expect(state.players[2].id).toBe('ai-2')
  })

  it('deals 15 cards each in 2p (adjusting for red 3s)', () => {
    const { state } = initGame('2p', 'easy', 2)
    // Each player's playable hand should be exactly 15 cards (red 3s are replaced).
    for (const player of state.players) {
      expect(player.hand.length).toBe(15)
    }
  })

  it('deals 13 cards each in 3p', () => {
    const { state } = initGame('3p', 'easy', 3)
    for (const player of state.players) {
      expect(player.hand.length).toBe(13)
    }
  })

  it('starts with phase draw', () => {
    const { state } = initGame('2p', 'easy', 2)
    expect(state.phase).toBe('draw')
  })

  it('initialises discard pile with one card', () => {
    const { state } = initGame('2p', 'easy', 2)
    expect(state.pile.cards).toHaveLength(1)
  })

  it('all cards are accounted for after init', () => {
    // Total cards in hands + red3s + pile + stock must equal 108
    const { state } = initGame('2p', 'easy', 2)
    const totalAccountedFor =
      state.players.reduce(
        (sum, p) => sum + p.hand.length + p.red3s.length,
        0,
      ) +
      state.pile.cards.length +
      state.stock.length
    expect(totalAccountedFor).toBe(108)
  })

  it('red 3s are auto-placed from initial hand', () => {
    // Red 3s should NOT appear in hand; they go to red3s array
    const { state } = initGame('2p', 'easy', 2)
    for (const player of state.players) {
      const red3sInHand = player.hand.filter(
        c => c.rank === '3' && (c.suit === 'hearts' || c.suit === 'diamonds'),
      )
      expect(red3sInHand).toHaveLength(0)
    }
  })

  it('no player starts with hasOpenedMelds = true', () => {
    const { state } = initGame('2p', 'easy', 2)
    for (const p of state.players) {
      expect(p.hasOpenedMelds).toBe(false)
    }
  })

  it('returns the difficulty unchanged', () => {
    const { difficulty } = initGame('2p', 'hard', 2)
    expect(difficulty).toBe('hard')
  })
})

// ─── applyDrawFromStock ───────────────────────────────────────────────────────

describe('applyDrawFromStock', () => {
  it('adds 2 cards to the current player hand', () => {
    const { state } = initGame('2p', 'easy', 2)
    const newState = applyDrawFromStock(state)
    // hand + red3s increases by exactly 2 (red 3s are replaced from stock)
    const handIncrease =
      newState.players[0].hand.length +
      newState.players[0].red3s.length -
      (state.players[0].hand.length + state.players[0].red3s.length)
    expect(handIncrease).toBe(2)
  })

  it('removes 2 cards from the stock', () => {
    const { state } = initGame('2p', 'easy', 2)
    const stockBefore = state.stock.length
    const newState = applyDrawFromStock(state)
    // Stock decreases by 2 (± replacements for red 3s cancel out)
    const stockDecrease = stockBefore - newState.stock.length
    expect(stockDecrease).toBe(2)
  })

  it('transitions phase to meld', () => {
    const { state } = initGame('2p', 'easy', 2)
    const newState = applyDrawFromStock(state)
    expect(newState.phase).toBe('meld')
  })

  it('returns unchanged state if stock is empty', () => {
    const { state } = initGame('2p', 'easy', 2)
    const emptyStock = { ...state, stock: [] }
    const result = applyDrawFromStock(emptyStock)
    expect(result).toBe(emptyStock)
  })

  it('auto-places red 3s drawn from stock', () => {
    const { state } = initGame('2p', 'easy', 2)
    // Inject a red 3 at the top of the stock
    const red3: Card = { rank: '3', suit: 'hearts', id: '3-hearts-test' }
    const injected = { ...state, stock: [red3, ...state.stock] }
    const newState = applyDrawFromStock(injected)
    // The red 3 must not be in the human's hand
    const red3InHand = newState.players[0].hand.find(c => c.id === '3-hearts-test')
    expect(red3InHand).toBeUndefined()
    // It must be in red3s
    const red3Placed = newState.players[0].red3s.find(c => c.id === '3-hearts-test')
    expect(red3Placed).toBeDefined()
  })
})

// ─── applyPlaceMeld ───────────────────────────────────────────────────────────

describe('applyPlaceMeld', () => {
  it('rejects invalid melds (returns same state)', () => {
    const { state } = initGame('2p', 'easy', 2)
    const meldState = { ...state, phase: 'meld' as const }
    // Only 2 cards — not a valid meld
    const twoCardIds = meldState.players[0].hand.slice(0, 2).map(c => c.id)
    const result = applyPlaceMeld(meldState, 'human', twoCardIds)
    expect(result).toBe(meldState)
  })

  it('places a valid meld and removes cards from hand', () => {
    const { state } = initGame('2p', 'easy', 2)
    // Build a forced scenario: inject 3 Aces into human hand
    const ace1: Card = makeCard('A', 'hearts', 99)
    const ace2: Card = makeCard('A', 'spades', 99)
    const ace3: Card = makeCard('A', 'clubs', 99)
    const hand = [ace1, ace2, ace3, ...state.players[0].hand]
    const injected = {
      ...state,
      phase: 'meld' as const,
      players: state.players.map((p, i) => (i === 0 ? { ...p, hand } : p)),
    }
    const result = applyPlaceMeld(injected, 'human', [ace1.id, ace2.id, ace3.id])
    expect(result).not.toBe(injected)
    expect(result.players[0].melds).toHaveLength(1)
    expect(result.players[0].melds[0].rank).toBe('A')
    const remaining = result.players[0].hand.find(c => c.id === ace1.id)
    expect(remaining).toBeUndefined()
  })

  it('sets hasOpenedMelds to true', () => {
    const { state } = initGame('2p', 'easy', 2)
    const ace1: Card = makeCard('A', 'hearts', 99)
    const ace2: Card = makeCard('A', 'spades', 99)
    const ace3: Card = makeCard('A', 'clubs', 99)
    const hand = [ace1, ace2, ace3, ...state.players[0].hand]
    const injected = {
      ...state,
      phase: 'meld' as const,
      players: state.players.map((p, i) =>
        i === 0 ? { ...p, hand, score: 0, hasOpenedMelds: false } : p,
      ),
    }
    const result = applyPlaceMeld(injected, 'human', [ace1.id, ace2.id, ace3.id])
    expect(result.players[0].hasOpenedMelds).toBe(true)
  })
})

// ─── applyAddToMeld ───────────────────────────────────────────────────────────

describe('applyAddToMeld', () => {
  it('adds a card to an existing meld', () => {
    const { state } = initGame('2p', 'easy', 2)
    // Create a meld state with a known meld
    const ace1: Card = makeCard('A', 'hearts', 99)
    const ace2: Card = makeCard('A', 'spades', 99)
    const ace3: Card = makeCard('A', 'clubs', 99)
    const ace4: Card = makeCard('A', 'diamonds', 99)
    const meldCard = { rank: 'A' as const, naturals: [ace1, ace2, ace3], wilds: [] }
    const players = state.players.map((p, i) =>
      i === 0
        ? {
            ...p,
            hand: [ace4, ...p.hand],
            melds: [meldCard],
            hasOpenedMelds: true,
          }
        : p,
    )
    const meldState = { ...state, phase: 'meld' as const, players }
    const result = applyAddToMeld(meldState, 'human', [ace4.id], 0)
    expect(result).not.toBe(meldState)
    expect(result.players[0].melds[0].naturals).toHaveLength(4)
    expect(result.players[0].hand.find(c => c.id === ace4.id)).toBeUndefined()
  })

  it('rejects adding a card that does not match meld rank', () => {
    const { state } = initGame('2p', 'easy', 2)
    const king: Card = makeCard('K', 'hearts', 99)
    const meld = { rank: 'A' as const, naturals: [makeCard('A', 'hearts', 1), makeCard('A', 'spades', 1), makeCard('A', 'clubs', 1)], wilds: [] }
    const players = state.players.map((p, i) =>
      i === 0 ? { ...p, hand: [king, ...p.hand], melds: [meld], hasOpenedMelds: true } : p,
    )
    const meldState = { ...state, phase: 'meld' as const, players }
    const result = applyAddToMeld(meldState, 'human', [king.id], 0)
    expect(result).toBe(meldState) // no change
  })
})

// ─── applyDiscard ─────────────────────────────────────────────────────────────

describe('applyDiscard', () => {
  it('removes card from hand and adds to pile', () => {
    const { state } = initGame('2p', 'easy', 2)
    const meldState = { ...state, phase: 'meld' as const }
    const card = meldState.players[0].hand[0]
    const result = applyDiscard(meldState, 'human', card.id)
    expect(result).not.toBe(meldState)
    expect(result.players[0].hand.find(c => c.id === card.id)).toBeUndefined()
    expect(result.pile.cards[result.pile.cards.length - 1].id).toBe(card.id)
  })

  it('advances to next player after discard', () => {
    const { state } = initGame('2p', 'easy', 2)
    const meldState = { ...state, phase: 'meld' as const }
    const card = meldState.players[0].hand[0]
    const result = applyDiscard(meldState, 'human', card.id)
    expect(result.currentPlayerIndex).toBe(1)
    expect(result.phase).toBe('draw')
  })

  it('detects going out when hand is emptied with a canasta', () => {
    const { state } = initGame('2p', 'easy', 2)
    // Set up: player has one card in hand, has a canasta
    const lastCard: Card = makeCard('4', 'spades', 99)
    // Build a canasta meld (7 fours)
    const canastaMeld: Meld = buildMeld([
      makeCard('4', 'hearts', 1),
      makeCard('4', 'hearts', 2),
      makeCard('4', 'diamonds', 1),
      makeCard('4', 'diamonds', 2),
      makeCard('4', 'clubs', 1),
      makeCard('4', 'clubs', 2),
      makeCard('4', 'spades', 1),
    ])
    const goingOutState = {
      ...state,
      phase: 'meld' as const,
      players: state.players.map((p, i) =>
        i === 0
          ? {
              ...p,
              hand: [lastCard],
              melds: [canastaMeld],
              hasOpenedMelds: true,
            }
          : p,
      ),
    }
    const result = applyDiscard(goingOutState, 'human', lastCard.id)
    expect(result.phase).toBe('end')
  })

  it('cannot discard a red 3', () => {
    const { state } = initGame('2p', 'easy', 2)
    const meldState = { ...state, phase: 'meld' as const }
    // Inject a red 3 into hand (simulate edge case)
    const red3: Card = makeCard('3', 'hearts', 99)
    const players = meldState.players.map((p, i) =>
      i === 0 ? { ...p, hand: [red3, ...p.hand] } : p,
    )
    const injected = { ...meldState, players }
    const result = applyDiscard(injected, 'human', red3.id)
    expect(result).toBe(injected) // no change
  })
})

// ─── applyEndRound ────────────────────────────────────────────────────────────

describe('applyEndRound', () => {
  it('updates player running scores', () => {
    const { state } = initGame('2p', 'easy', 2)
    const endState = { ...state, phase: 'end' as const }
    const result = applyEndRound(endState, null)
    // Scores are updated (may be negative or positive depending on hand)
    // Just verify they are numbers
    for (const p of result.players) {
      expect(typeof p.score).toBe('number')
    }
  })

  it('stores round scores entry', () => {
    const { state } = initGame('2p', 'easy', 2)
    const endState = { ...state, phase: 'end' as const }
    const result = applyEndRound(endState, null)
    expect(result.roundScores).toHaveLength(1)
    expect(typeof result.roundScores[0]['human']).toBe('number')
    expect(typeof result.roundScores[0]['ai-1']).toBe('number')
  })

  it('resets hands for next round when not matchOver', () => {
    const { state } = initGame('2p', 'easy', 2)
    const endState = { ...state, phase: 'end' as const }
    const result = applyEndRound(endState, null)
    if (!result.matchOver) {
      // Hands should be re-dealt; red 3s are replaced so hand.length = 15
      expect(result.players[0].hand.length).toBe(15)
      expect(result.players[0].melds).toHaveLength(0)
      expect(result.players[0].hasOpenedMelds).toBe(false)
      expect(result.phase).toBe('draw')
    }
  })

  it('sets matchOver when a player exceeds 5000', () => {
    const { state } = initGame('2p', 'easy', 2)
    // Give the human a very high score (near 5000)
    const highScoreState = {
      ...state,
      phase: 'end' as const,
      players: state.players.map((p, i) =>
        i === 0
          ? {
              ...p,
              score: 4900,
              melds: [
                buildMeld([
                  makeCard('A', 'hearts', 1),
                  makeCard('A', 'spades', 1),
                  makeCard('A', 'clubs', 1),
                  makeCard('A', 'diamonds', 1),
                  makeCard('A', 'hearts', 2),
                  makeCard('A', 'spades', 2),
                  makeCard('A', 'clubs', 2),
                ]),
              ],
              hand: [],
              hasOpenedMelds: true,
            }
          : p,
      ),
    }
    const result = applyEndRound(highScoreState, 'human')
    expect(result.matchOver).toBe(true)
    expect(result.phase).toBe('end')
  })

  it('going-out player gets bonus', () => {
    const { state } = initGame('2p', 'easy', 2)
    const endState = {
      ...state,
      phase: 'end' as const,
      players: state.players.map((p, i) =>
        i === 0 ? { ...p, hand: [], hasOpenedMelds: true } : p,
      ),
    }
    const resultOut = applyEndRound(endState, 'human')
    const resultNoOut = applyEndRound(endState, null)
    const humanScoreOut = resultOut.roundScores[0]['human']
    const humanScoreNoOut = resultNoOut.roundScores[0]['human']
    // Going-out bonus is at least 100
    expect(humanScoreOut - humanScoreNoOut).toBeGreaterThanOrEqual(100)
  })
})

// ─── applyPickUpPile ─────────────────────────────────────────────────────────

describe('applyPickUpPile', () => {
  it('returns same state if pile is blocked', () => {
    const { state } = initGame('2p', 'easy', 2)
    const blocked = {
      ...state,
      pile: { ...state.pile, blockedOneTurn: true, cards: state.pile.cards },
    }
    const result = applyPickUpPile(blocked)
    expect(result).toBe(blocked)
  })
})

// ─── getHint ──────────────────────────────────────────────────────────────────

describe('getHint', () => {
  it('returns a non-empty string in draw phase', () => {
    const { state } = initGame('2p', 'easy', 2)
    expect(state.phase).toBe('draw')
    const hint = getHint(state)
    expect(typeof hint).toBe('string')
    expect(hint.length).toBeGreaterThan(0)
  })

  it('returns a non-empty string in meld phase', () => {
    const { state } = initGame('2p', 'easy', 2)
    const meldState = { ...state, phase: 'meld' as const }
    const hint = getHint(meldState)
    expect(typeof hint).toBe('string')
    expect(hint.length).toBeGreaterThan(0)
  })

  it('mentions canasta when near going out', () => {
    const { state } = initGame('2p', 'easy', 2)
    const lastCard: Card = makeCard('5', 'spades', 99)
    const canastaMeld: Meld = buildMeld([
      makeCard('5', 'hearts', 1),
      makeCard('5', 'diamonds', 1),
      makeCard('5', 'clubs', 1),
      makeCard('5', 'spades', 1),
      makeCard('5', 'hearts', 2),
      makeCard('5', 'diamonds', 2),
      makeCard('5', 'clubs', 2),
    ])
    const nearOutState = {
      ...state,
      phase: 'meld' as const,
      players: state.players.map((p, i) =>
        i === 0
          ? {
              ...p,
              hand: [lastCard],
              melds: [canastaMeld],
              hasOpenedMelds: true,
            }
          : p,
      ),
    }
    const hint = getHint(nearOutState)
    expect(hint.toLowerCase()).toContain('canasta')
  })
})

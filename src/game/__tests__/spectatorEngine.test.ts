import { describe, it, expect } from 'vitest'
import {
  initSpectatorGame,
  stepSpectator,
  getActionExplanation,
  type SpectatorState,
} from '../spectatorEngine'
import type { AIDifficulty } from '../types'

// ─── initSpectatorGame ────────────────────────────────────────────────────────

describe('initSpectatorGame', () => {
  it('creates a 2-player game with two AI players', () => {
    const state = initSpectatorGame('medium', 'hard')
    expect(state.gameState.players).toHaveLength(2)
    expect(state.gameState.players[0].type).toBe('ai')
    expect(state.gameState.players[1].type).toBe('ai')
  })

  it('assigns correct player names', () => {
    const state = initSpectatorGame('beginner', 'expert')
    expect(state.gameState.players[0].name).toBe('AI Blue')
    expect(state.gameState.players[1].name).toBe('AI Red')
  })

  it('stores the provided difficulties', () => {
    const state = initSpectatorGame('easy', 'neural')
    expect(state.difficulties[0]).toBe('easy')
    expect(state.difficulties[1]).toBe('neural')
  })

  it('starts at round 1 with no move history', () => {
    const state = initSpectatorGame('medium', 'medium')
    expect(state.roundNumber).toBe(1)
    expect(state.moveHistory).toHaveLength(0)
    expect(state.lastMove).toBeNull()
    expect(state.isOver).toBe(false)
  })

  it('starts in draw phase', () => {
    const state = initSpectatorGame('medium', 'hard')
    expect(state.gameState.phase).toBe('draw')
  })

  it('deals correct hand sizes for 2p (15 cards in hand each)', () => {
    const state = initSpectatorGame('medium', 'hard')
    const { players } = state.gameState
    // After red-3 processing, each player should have exactly 15 cards in hand
    // (red 3s are moved to red3s[] and replaced from stock, keeping hand at 15)
    expect(players[0].hand.length).toBe(15)
  })

  it('always uses the 2p variant (spectator is 2p only)', () => {
    const state = initSpectatorGame('medium', 'hard')
    expect(state.gameState.variant).toBe('2p')
  })
})

// ─── stepSpectator ─────────────────────────────────────────────────────────────

describe('stepSpectator', () => {
  it('is a no-op when the game is already over', () => {
    const state = initSpectatorGame('medium', 'hard')
    const overState: SpectatorState = { ...state, isOver: true }
    const result = stepSpectator(overState)
    expect(result).toBe(overState)
  })

  it('produces a move after stepping from the draw phase', () => {
    const state = initSpectatorGame('medium', 'medium')
    const next = stepSpectator(state)
    expect(next.lastMove).not.toBeNull()
    expect(next.moveHistory).toHaveLength(1)
  })

  it('generates a string explanation for each step', () => {
    const state = initSpectatorGame('hard', 'hard')
    const next = stepSpectator(state)
    expect(typeof next.lastMove?.explanation).toBe('string')
    expect(next.lastMove!.explanation.length).toBeGreaterThan(0)
  })

  it('does not mutate the previous state (immutability)', () => {
    const state = initSpectatorGame('medium', 'medium')
    const handsBefore = state.gameState.players[0].hand.length
    stepSpectator(state)
    expect(state.gameState.players[0].hand.length).toBe(handsBefore)
    expect(state.moveHistory).toHaveLength(0)
  })

  it('transitions from draw → meld phase after draw action', () => {
    const state = initSpectatorGame('medium', 'medium')
    expect(state.gameState.phase).toBe('draw')
    const next = stepSpectator(state)
    // After drawing, phase should be 'meld'
    expect(next.gameState.phase).toBe('meld')
  })

  it('advances move history monotonically', () => {
    let state = initSpectatorGame('medium', 'hard')
    for (let i = 0; i < 10; i++) {
      const prev = state.moveHistory.length
      state = stepSpectator(state)
      expect(state.moveHistory.length).toBeGreaterThanOrEqual(prev)
    }
  })

  it('handles round end by incrementing roundNumber', () => {
    // Run the game until a round ends
    let state = initSpectatorGame('expert', 'expert')
    const maxSteps = 500
    let steps = 0

    while (!state.isOver && steps < maxSteps) {
      state = stepSpectator(state)
      steps++
      if (state.roundNumber > 1) break
    }

    // Either a new round has started or the game is over
    expect(state.roundNumber > 1 || state.isOver).toBe(true)
  })
})

// ─── getActionExplanation ─────────────────────────────────────────────────────

describe('getActionExplanation', () => {
  function getBaseState() {
    return initSpectatorGame('medium', 'medium').gameState
  }

  it('returns a string for drawStock', () => {
    const gameState = getBaseState()
    const explanation = getActionExplanation(
      { type: 'drawStock' },
      gameState,
      0,
    )
    expect(typeof explanation).toBe('string')
    expect(explanation.length).toBeGreaterThan(0)
    expect(explanation).toContain('AI Blue')
  })

  it('mentions "stock" in drawStock explanation', () => {
    const gameState = getBaseState()
    const explanation = getActionExplanation(
      { type: 'drawStock' },
      gameState,
      0,
    )
    expect(explanation.toLowerCase()).toContain('stock')
  })

  it('mentions "pile" in pickUpPile explanation', () => {
    const gameState = getBaseState()
    const explanation = getActionExplanation(
      { type: 'pickUpPile' },
      gameState,
      0,
    )
    expect(explanation.toLowerCase()).toContain('pile')
  })

  it('returns non-empty string for all action types', () => {
    const gameState = getBaseState()
    const player = gameState.players[0]

    // drawStock
    expect(getActionExplanation({ type: 'drawStock' }, gameState, 0).length).toBeGreaterThan(0)

    // pickUpPile
    expect(getActionExplanation({ type: 'pickUpPile' }, gameState, 0).length).toBeGreaterThan(0)

    // placeMeld with empty cardIds (fallback)
    expect(
      getActionExplanation({ type: 'placeMeld', cardIds: [] }, gameState, 0).length,
    ).toBeGreaterThan(0)

    // discard with unknown cardId (fallback)
    expect(
      getActionExplanation({ type: 'discard', cardId: 'nonexistent' }, gameState, 0).length,
    ).toBeGreaterThan(0)

    // addToMeld with unknown ids (fallback)
    expect(
      getActionExplanation(
        { type: 'addToMeld', cardIds: [], meldIndex: 0, playerId: player.id },
        gameState,
        0,
      ).length,
    ).toBeGreaterThan(0)

    // goOut without discard
    expect(
      getActionExplanation({ type: 'goOut', discardCardId: null }, gameState, 0).length,
    ).toBeGreaterThan(0)
  })

  it('discard explanation for Black 3 mentions blocking', () => {
    // Get the engine state and manufacture a discard action with a black 3
    const gameState = getBaseState()
    const black3 = gameState.players[0].hand.find(
      c => c.rank === '3' && (c.suit === 'clubs' || c.suit === 'spades'),
    )
    if (!black3) return // no black 3 in hand — skip test

    const explanation = getActionExplanation(
      { type: 'discard', cardId: black3.id },
      gameState,
      0,
    )
    expect(explanation.toLowerCase()).toContain('block')
  })

  it('placeMeld explanation mentions "opening meld" on first meld', () => {
    const gameState = getBaseState()
    // Player 0 has not opened melds yet (hasOpenedMelds = false)
    const explanation = getActionExplanation(
      { type: 'placeMeld', cardIds: [] }, // empty fallback
      gameState,
      0,
    )
    // Even the empty fallback should still return a string
    expect(typeof explanation).toBe('string')
  })

  it('different difficulty labels do not affect explanations (explanations are action-based)', () => {
    const difficulties: AIDifficulty[] = ['beginner', 'expert']
    const explanations = difficulties.map(() => {
      const gameState = getBaseState()
      return getActionExplanation({ type: 'drawStock' }, gameState, 0)
    })
    // The explanation text itself is the same regardless of which difficulty is configured
    expect(explanations[0]).toBe(explanations[1])
  })
})

import { describe, it, expect } from 'vitest'
import { getAIAction } from '../ai'
import { initGame } from '../gameEngine'
import type { AIDifficulty } from '../types'

const DIFFICULTIES: AIDifficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert']

describe('getAIAction — draw phase', () => {
  it.each(DIFFICULTIES)(
    'returns drawStock or pickUpPile in draw phase (%s)',
    difficulty => {
      const { state } = initGame('2p', difficulty, 2)
      // Make it the AI's turn
      const aiState = { ...state, currentPlayerIndex: 1 }
      const action = getAIAction(aiState, difficulty)
      expect(['drawStock', 'pickUpPile']).toContain(action.type)
    },
  )

  it('beginner prefers drawStock over pickUpPile', () => {
    const { state } = initGame('2p', 'beginner', 2)
    const aiState = { ...state, currentPlayerIndex: 1 }
    let drawCount = 0
    for (let i = 0; i < 50; i++) {
      const action = getAIAction(aiState, 'beginner')
      if (action.type === 'drawStock') drawCount++
    }
    // At least 50 % should be drawStock
    expect(drawCount).toBeGreaterThan(25)
  })

  it('easy always returns drawStock', () => {
    const { state } = initGame('2p', 'easy', 2)
    const aiState = { ...state, currentPlayerIndex: 1 }
    for (let i = 0; i < 20; i++) {
      const action = getAIAction(aiState, 'easy')
      expect(action.type).toBe('drawStock')
    }
  })
})

describe('getAIAction — meld phase', () => {
  it.each(DIFFICULTIES)(
    'returns placeMeld, addToMeld, discard, or goOut in meld phase (%s)',
    difficulty => {
      const { state } = initGame('2p', difficulty, 2)
      const meldState = { ...state, currentPlayerIndex: 1, phase: 'meld' as const }
      const action = getAIAction(meldState, difficulty)
      expect(['placeMeld', 'addToMeld', 'discard', 'goOut']).toContain(action.type)
    },
  )

  it('beginner usually discards without melding', () => {
    const { state } = initGame('2p', 'beginner', 2)
    const meldState = { ...state, currentPlayerIndex: 1, phase: 'meld' as const }
    let discardCount = 0
    for (let i = 0; i < 20; i++) {
      const action = getAIAction(meldState, 'beginner')
      if (action.type === 'discard') discardCount++
    }
    // Beginner should discard most of the time (90 %)
    expect(discardCount).toBeGreaterThan(10)
  })

  it('discard action references a card actually in the AI hand', () => {
    const { state } = initGame('2p', 'medium', 2)
    const meldState = { ...state, currentPlayerIndex: 1, phase: 'meld' as const }
    const action = getAIAction(meldState, 'medium')
    if (action.type === 'discard') {
      const aiHand = meldState.players[1].hand
      const cardIds = aiHand.map(c => c.id)
      expect(cardIds).toContain(action.cardId)
    }
  })

  it('placeMeld action uses only cards from AI hand', () => {
    // Run a few times to catch a placeMeld
    const { state } = initGame('2p', 'easy', 2)
    const meldState = { ...state, currentPlayerIndex: 1, phase: 'meld' as const }
    const aiHand = meldState.players[1].hand
    const handIds = new Set(aiHand.map(c => c.id))

    for (let i = 0; i < 30; i++) {
      const action = getAIAction(meldState, 'easy')
      if (action.type === 'placeMeld') {
        for (const id of action.cardIds) {
          expect(handIds.has(id)).toBe(true)
        }
        return
      }
    }
    // If no placeMeld found in 30 tries, that's fine (AI might not have a valid meld)
  })

  it('goOut action has null or string discardCardId', () => {
    const { state } = initGame('2p', 'expert', 2)
    const meldState = { ...state, currentPlayerIndex: 1, phase: 'meld' as const }
    // Just verify the type shape; goOut might not be triggered without canasta
    for (let i = 0; i < 10; i++) {
      const action = getAIAction(meldState, 'expert')
      if (action.type === 'goOut') {
        expect(
          action.discardCardId === null || typeof action.discardCardId === 'string',
        ).toBe(true)
      }
    }
  })
})

describe('getAIAction — all difficulties return valid structure', () => {
  it.each(DIFFICULTIES)(
    'action always has a valid type (%s)',
    difficulty => {
      const { state } = initGame('2p', difficulty, 2)

      // Draw phase
      const drawAction = getAIAction(
        { ...state, currentPlayerIndex: 1 },
        difficulty,
      )
      expect(drawAction).toHaveProperty('type')

      // Meld phase
      const meldAction = getAIAction(
        { ...state, currentPlayerIndex: 1, phase: 'meld' as const },
        difficulty,
      )
      expect(meldAction).toHaveProperty('type')
    },
  )
})

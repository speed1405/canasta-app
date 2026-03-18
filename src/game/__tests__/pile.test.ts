import { describe, it, expect } from 'vitest'
import type { Card, PileState } from '../types'
import {
  createPile,
  topCard,
  discardCard,
  beginTurn,
  isPilePickupAllowed,
  pickUpPile,
  isPileFrozen,
} from '../pile'

const card = (rank: Card['rank'], suit: Card['suit'] = 'spades', idx = 0): Card => ({
  rank,
  suit,
  id: `${rank}-${suit ?? 'null'}-${idx}`,
})

const wild = (): Card => ({ rank: '2', suit: 'hearts', id: '2-hearts-0' })
const joker = (): Card => ({ rank: 'Joker', suit: null, id: 'Joker-null-0' })
const black3 = (): Card => ({ rank: '3', suit: 'spades', id: '3-spades-0' })

describe('createPile', () => {
  it('creates an empty, unfrozen, unblocked pile', () => {
    const pile = createPile()
    expect(pile.cards).toHaveLength(0)
    expect(pile.frozen).toBe(false)
    expect(pile.blockedOneTurn).toBe(false)
  })
})

describe('topCard', () => {
  it('returns null for empty pile', () => {
    expect(topCard(createPile())).toBeNull()
  })

  it('returns the last card added', () => {
    const pile: PileState = {
      cards: [card('A'), card('K')],
      frozen: false,
      blockedOneTurn: false,
    }
    expect(topCard(pile)!.rank).toBe('K')
  })
})

describe('discardCard', () => {
  it('adds card to pile', () => {
    const pile = createPile()
    const updated = discardCard(pile, card('K'))
    expect(updated.cards).toHaveLength(1)
  })

  it('freezes the pile when a 2 is discarded', () => {
    const pile = createPile()
    const updated = discardCard(pile, wild())
    expect(updated.frozen).toBe(true)
  })

  it('freezes the pile when a joker is discarded', () => {
    const pile = createPile()
    const updated = discardCard(pile, joker())
    expect(updated.frozen).toBe(true)
  })

  it('does not unfreeze a frozen pile', () => {
    const pile: PileState = { cards: [], frozen: true, blockedOneTurn: false }
    const updated = discardCard(pile, card('K'))
    expect(updated.frozen).toBe(true)
  })

  it('sets blockedOneTurn when black 3 is discarded', () => {
    const pile = createPile()
    const updated = discardCard(pile, black3())
    expect(updated.blockedOneTurn).toBe(true)
  })

  it('clears blockedOneTurn for non-black-3', () => {
    const pile: PileState = { cards: [], frozen: false, blockedOneTurn: true }
    const updated = discardCard(pile, card('K'))
    expect(updated.blockedOneTurn).toBe(false)
  })

  it('does not mutate the original pile', () => {
    const pile = createPile()
    discardCard(pile, card('K'))
    expect(pile.cards).toHaveLength(0)
  })
})

describe('beginTurn', () => {
  it('clears the one-turn block', () => {
    const pile: PileState = {
      cards: [black3()],
      frozen: false,
      blockedOneTurn: true,
    }
    const updated = beginTurn(pile)
    expect(updated.blockedOneTurn).toBe(false)
  })

  it('returns same reference if not blocked', () => {
    const pile = createPile()
    expect(beginTurn(pile)).toBe(pile)
  })
})

describe('isPilePickupAllowed', () => {
  it('returns false for empty pile', () => {
    expect(isPilePickupAllowed(createPile())).toBe(false)
  })

  it('returns false when blocked', () => {
    const pile: PileState = {
      cards: [card('K')],
      frozen: false,
      blockedOneTurn: true,
    }
    expect(isPilePickupAllowed(pile)).toBe(false)
  })

  it('returns true for non-empty, non-blocked pile', () => {
    const pile: PileState = {
      cards: [card('K')],
      frozen: false,
      blockedOneTurn: false,
    }
    expect(isPilePickupAllowed(pile)).toBe(true)
  })
})

describe('pickUpPile', () => {
  it('returns all pile cards and resets the pile', () => {
    const pile: PileState = {
      cards: [card('K'), card('Q')],
      frozen: false,
      blockedOneTurn: false,
    }
    const { taken, newPile } = pickUpPile(pile)
    expect(taken).toHaveLength(2)
    expect(newPile.cards).toHaveLength(0)
    expect(newPile.frozen).toBe(false)
  })
})

describe('isPileFrozen', () => {
  it('returns true when frozen', () => {
    const pile: PileState = { cards: [], frozen: true, blockedOneTurn: false }
    expect(isPileFrozen(pile)).toBe(true)
  })

  it('returns false when not frozen', () => {
    expect(isPileFrozen(createPile())).toBe(false)
  })
})

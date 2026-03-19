import type { Card, PileState } from './types'
import { isWild, isBlack3 } from './types'

/**
 * Create an empty discard pile.
 */
export function createPile(): PileState {
  return { cards: [], frozen: false, blockedOneTurn: false }
}

/**
 * Return the top card of the discard pile, or null if empty.
 */
export function topCard(pile: PileState): Card | null {
  return pile.cards.length > 0 ? pile.cards[pile.cards.length - 1] : null
}

/**
 * Discard a card onto the pile (immutably).
 *
 * - Discarding a wild card permanently freezes the pile.
 * - Discarding a black 3 blocks the pile for one turn; discarding any other
 *   card automatically clears the block (see `blockedOneTurn` assignment below).
 */
export function discardCard(pile: PileState, card: Card): PileState {
  const frozen = pile.frozen || isWild(card)
  const blockedOneTurn = isBlack3(card)

  return {
    cards: [...pile.cards, card],
    frozen,
    blockedOneTurn,
  }
}

/**
 * Begin a player's turn: clear the one-turn black-3 block (if any).
 */
export function beginTurn(pile: PileState): PileState {
  if (!pile.blockedOneTurn) return pile
  return { ...pile, blockedOneTurn: false }
}

/**
 * Can the current player pick up the discard pile?
 *
 * The pile can be picked up when ALL of the following are true:
 * 1. The pile is not empty.
 * 2. The pile is not blocked by a black 3 this turn.
 * 3. If frozen: the player must hold two natural cards matching the top card.
 * 4. If not frozen: the player must be able to use the top card (either they
 *    already have a meld of that rank, or they can form a new meld with it and
 *    two more cards from their hand).
 *
 * This function validates condition (2) and (1). Conditions (3) and (4) are
 * checked by rules.ts using the player's hand context.
 */
export function isPilePickupAllowed(pile: PileState): boolean {
  if (pile.cards.length === 0) return false
  if (pile.blockedOneTurn) return false
  return true
}

/**
 * Pick up the entire discard pile. Returns the taken cards and an empty pile.
 */
export function pickUpPile(pile: PileState): { taken: Card[]; newPile: PileState } {
  return {
    taken: [...pile.cards],
    newPile: createPile(),
  }
}

/**
 * Check whether the pile is currently frozen.
 */
export function isPileFrozen(pile: PileState): boolean {
  return pile.frozen
}

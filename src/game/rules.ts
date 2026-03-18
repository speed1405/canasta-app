import type { Card, Meld, PileState, Player, Variant } from './types'
import { isWild, isRed3, isBlack3, minimumMeldPoints } from './types'
import { isMeldValid, meldPointValue, isMeldCanasta, canAddToMeld } from './meld'
import { topCard } from './pile'

// ─── Result type ────────────────────────────────────────────────────────────

export type RuleResult =
  | { ok: true }
  | { ok: false; reason: string }

function ok(): RuleResult {
  return { ok: true }
}

function fail(reason: string): RuleResult {
  return { ok: false, reason }
}

// ─── Drawing ─────────────────────────────────────────────────────────────────

/**
 * Validate drawing 2 cards from the stock.
 */
export function validateDrawFromStock(stock: Card[]): RuleResult {
  if (stock.length === 0) return fail('Stock is empty.')
  return ok()
}

/**
 * Validate picking up the discard pile.
 *
 * Requirements:
 * 1. Pile must not be empty or blocked.
 * 2. If the pile is frozen, the player must hold two natural cards matching
 *    the top card.
 * 3. If the pile is not frozen, the player must either:
 *    a. Already have an open meld of the top card's rank, OR
 *    b. Be able to form a new 3-card meld using the top card + 2 from hand.
 */
export function validatePickUpPile(
  pile: PileState,
  playerHand: Card[],
  playerMelds: Meld[],
): RuleResult {
  if (pile.cards.length === 0) return fail('The discard pile is empty.')
  if (pile.blockedOneTurn)
    return fail('The pile is blocked this turn (black 3 on top).')

  const top = topCard(pile)!

  // Top card cannot be picked up if it's a red 3
  if (isRed3(top)) return fail('Cannot pick up a pile topped by a red 3.')

  if (pile.frozen) {
    // Must hold two natural cards matching the top rank
    const matching = playerHand.filter(
      (c) => !isWild(c) && !isRed3(c) && !isBlack3(c) && c.rank === top.rank,
    )
    if (matching.length < 2) {
      return fail(
        `Pile is frozen. You need at least two natural ${top.rank}s in hand to pick it up.`,
      )
    }
    return ok()
  }

  // Not frozen: check if player can use the top card
  const existingMeld = playerMelds.find((m) => m.rank === top.rank)
  if (existingMeld) return ok()

  // Can they form a new meld with top card + 2 from hand?
  const handNaturals = playerHand.filter(
    (c) => !isWild(c) && !isRed3(c) && !isBlack3(c) && c.rank === top.rank,
  )
  if (handNaturals.length >= 2) return ok()

  // With wilds?
  const handWilds = playerHand.filter(isWild)
  if (handNaturals.length >= 1 && handWilds.length >= 1) return ok()

  return fail(
    `You need cards in hand to use the ${top.rank} from the top of the pile.`,
  )
}

// ─── Melding ─────────────────────────────────────────────────────────────────

/**
 * Validate placing a new meld from the player's hand.
 *
 * - Cards must form a valid meld.
 * - If the player hasn't yet opened melds, the meld must meet the minimum
 *   initial meld requirement.
 */
export function validateNewMeld(
  cards: Card[],
  player: Player,
  _variant: Variant,
): RuleResult {
  if (!isMeldValid(cards)) {
    return fail(
      'Invalid meld: need at least 3 cards, at least 2 natural cards of the same rank, and wilds cannot outnumber naturals.',
    )
  }

  if (!player.hasOpenedMelds) {
    const points = meldPointValue(cards)
    const required = minimumMeldPoints(player.score)
    if (points < required) {
      return fail(
        `Initial meld must be worth at least ${required} points (your running score is ${player.score} pts). This meld is worth ${points} pts.`,
      )
    }
  }

  return ok()
}

/**
 * Validate adding cards to an existing meld.
 */
export function validateAddToMeld(cards: Card[], meld: Meld): RuleResult {
  for (const card of cards) {
    if (!canAddToMeld(meld, card)) {
      return fail(
        `Cannot add ${card.rank} to this ${meld.rank} meld. Wild-card limit may be exceeded or rank doesn't match.`,
      )
    }
  }
  return ok()
}

// ─── Discarding ──────────────────────────────────────────────────────────────

/**
 * Validate discarding a card.
 *
 * Restrictions:
 * - Wild cards can be discarded (though it freezes the pile).
 * - Red 3s cannot be discarded (they are placed face-up automatically).
 * - Black 3s can be discarded but only in normal play (not to go out unless
 *   using a pure black-3 meld — handled in validateGoOut).
 */
export function validateDiscard(card: Card): RuleResult {
  if (isRed3(card)) {
    return fail('Red 3s are placed face-up automatically and cannot be discarded.')
  }
  return ok()
}

// ─── Going out ───────────────────────────────────────────────────────────────

/**
 * Validate that a player can go out.
 *
 * A player may go out when:
 * 1. They have at least one completed canasta.
 * 2. They can meld and/or discard all remaining cards in hand.
 *
 * This function checks condition (1). Full going-out validation (verifying
 * the hand can be emptied) is the responsibility of the UI layer.
 */
export function validateGoOut(player: Player): RuleResult {
  const hasCanasta = player.melds.some(isMeldCanasta)
  if (!hasCanasta) {
    return fail(
      'You need at least one completed canasta (7+ cards of the same rank) before you can go out.',
    )
  }
  return ok()
}

/**
 * Determine whether a going-out is "concealed" (player melds entire hand at
 * once without having previously melded).
 */
export function isConcealed(player: Player): boolean {
  return !player.hasOpenedMelds
}

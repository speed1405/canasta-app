import type { GameState, AIDifficulty, Card, Player, Variant } from './types'
import { isWild, isRed3, isBlack3, cardPointValue, partnerIndex } from './types'
import { canAddToMeld, meldPointValue } from './meld'
import { validatePickUpPile, validateNewMeld } from './rules'
import { canGoOut } from './scoring'
import { topCard } from './pile'

export type AIAction =
  | { type: 'drawStock' }
  | { type: 'pickUpPile' }
  | { type: 'placeMeld'; cardIds: string[] }
  | { type: 'addToMeld'; cardIds: string[]; meldIndex: number; playerId: string }
  | { type: 'discard'; cardId: string }
  | { type: 'goOut'; discardCardId: string | null }

// ─── Public entry point ───────────────────────────────────────────────────────

export function getAIAction(state: GameState, difficulty: AIDifficulty): AIAction {
  const playerIndex = state.currentPlayerIndex
  const player = state.players[playerIndex]
  const isPartnership = state.variant === '4p-partnership'
  const partner = isPartnership ? state.players[partnerIndex(playerIndex)] : undefined

  if (state.phase === 'draw') {
    return getDrawAction(state, player, difficulty, partner)
  }

  // meld phase (or any non-draw phase except end)
  return getMeldOrDiscardAction(state, player, difficulty, partner)
}

// ─── Draw phase ───────────────────────────────────────────────────────────────

function getDrawAction(
  state: GameState,
  player: Player,
  difficulty: AIDifficulty,
  partner?: Player,
): AIAction {
  const pileAllowed =
    state.pile.cards.length > 0 &&
    !state.pile.blockedOneTurn &&
    validatePickUpPile(state.pile, player.hand, player.melds, partner?.melds).ok

  switch (difficulty) {
    case 'beginner':
      // 15 % chance to pick up pile if allowed
      if (pileAllowed && Math.random() < 0.15) return { type: 'pickUpPile' }
      return { type: 'drawStock' }

    case 'easy':
      // Never picks up pile deliberately
      return { type: 'drawStock' }

    case 'medium': {
      if (pileAllowed && isPileWorthTaking(state, player, 4, partner)) {
        return { type: 'pickUpPile' }
      }
      return { type: 'drawStock' }
    }

    case 'hard':
    case 'expert': {
      if (pileAllowed && isPileWorthTaking(state, player, 3, partner)) {
        return { type: 'pickUpPile' }
      }
      return { type: 'drawStock' }
    }

    case 'neural': {
      // Neural AI: always takes the pile when it's strategically beneficial,
      // using the most aggressive heuristic (min 2 matching cards or existing meld).
      if (pileAllowed && isPileWorthTaking(state, player, 2, partner)) {
        return { type: 'pickUpPile' }
      }
      return { type: 'drawStock' }
    }
  }
}

/** Heuristic: is the discard pile worth picking up? */
function isPileWorthTaking(
  state: GameState,
  player: Player,
  minCards: number,
  partner?: Player,
): boolean {
  if (state.pile.cards.length < minCards) return false
  const top = topCard(state.pile)
  if (!top) return false
  // Has an existing meld of the top rank (own or partner's) — definitely useful
  const allMelds = partner ? [...player.melds, ...partner.melds] : player.melds
  if (allMelds.some(m => m.rank === top.rank)) return true
  // Has 2+ cards matching top rank in hand
  const matching = player.hand.filter(
    c => !isWild(c) && !isRed3(c) && !isBlack3(c) && c.rank === top.rank,
  )
  return matching.length >= 2
}

// ─── Meld / Discard phase ─────────────────────────────────────────────────────

function getMeldOrDiscardAction(
  state: GameState,
  player: Player,
  difficulty: AIDifficulty,
  partner?: Player,
): AIAction {
  // If hand is empty and team has canasta → go out without discarding
  if (player.hand.length === 0) {
    if (canGoOut(player, partner?.melds)) return { type: 'goOut', discardCardId: null }
    // Shouldn't happen, but fall through to discard
  }

  // Beginner: skip melding 90 % of the time
  if (difficulty === 'beginner' && Math.random() < 0.9) {
    return buildDiscard(player, difficulty)
  }

  // Try to go out if eligible (medium / hard / expert)
  if (difficulty !== 'beginner' && difficulty !== 'easy') {
    const goOutAction = tryGoOut(state, player, partner)
    if (goOutAction) return goOutAction
  }

  // Attempt to add cards to existing melds first (all difficulties except beginner)
  if (difficulty !== 'beginner') {
    // In partnership: also try to add to partner's melds (cooperative strategy)
    const addAction = findBestAddToMeld(player, partner)
    if (addAction) return addAction
  }

  // Attempt to place a new meld (easy+)
  if (difficulty !== 'beginner') {
    const newMeldAction = findBestNewMeld(player, state.variant, partner)
    if (newMeldAction) return newMeldAction
  }

  // Default: discard
  return buildDiscard(player, difficulty)
}

/** Try going out: has canasta and can discard last card or hand is empty. */
function tryGoOut(_state: GameState, player: Player, partner?: Player): AIAction | null {
  if (!canGoOut(player, partner?.melds)) return null
  if (player.hand.length === 0) return { type: 'goOut', discardCardId: null }
  if (player.hand.length === 1) {
    const card = player.hand[0]
    if (!isRed3(card)) return { type: 'goOut', discardCardId: card.id }
  }
  return null
}

// ─── Meld finding helpers ─────────────────────────────────────────────────────

/**
 * Find the best new meld the AI can place (returns placeMeld action or null).
 * Prefers natural melds (no wilds) and high-value ranks.
 * In partnership mode, won't start a meld for a rank partner already has.
 */
function findBestNewMeld(player: Player, variant: Variant, partner?: Player): AIAction | null {
  const hand = player.hand
  const wilds = hand.filter(isWild)
  // In partnership, avoid starting melds for ranks partner already has (add to theirs instead)
  const partnerMeldRanks = new Set(partner?.melds.map(m => m.rank) ?? [])
  const existingRanks = new Set([...player.melds.map(m => m.rank), ...partnerMeldRanks])

  // Group naturals by rank
  const rankGroups = new Map<string, Card[]>()
  for (const card of hand) {
    if (!isWild(card) && !isRed3(card) && !isBlack3(card)) {
      if (!existingRanks.has(card.rank)) {
        const group = rankGroups.get(card.rank) ?? []
        group.push(card)
        rankGroups.set(card.rank, group)
      }
    }
  }

  const candidates: { cardIds: string[]; points: number; usesWild: boolean }[] = []

  for (const [, cards] of rankGroups) {
    // Pure natural meld (3+ naturals)
    if (cards.length >= 3) {
      const chosen = cards.slice(0, 3)
      const result = validateNewMeld(chosen, player, variant, partner?.hasOpenedMelds)
      if (result.ok) {
        candidates.push({
          cardIds: chosen.map(c => c.id),
          points: meldPointValue(chosen),
          usesWild: false,
        })
      }
    }
    // 2 naturals + 1 wild
    if (cards.length >= 2 && wilds.length >= 1) {
      const chosen = [...cards.slice(0, 2), wilds[0]]
      const result = validateNewMeld(chosen, player, variant, partner?.hasOpenedMelds)
      if (result.ok) {
        candidates.push({
          cardIds: chosen.map(c => c.id),
          points: meldPointValue(chosen),
          usesWild: true,
        })
      }
    }
  }

  if (candidates.length === 0) return null

  // Prefer natural melds; among equals, highest points
  candidates.sort((a, b) => {
    if (a.usesWild !== b.usesWild) return a.usesWild ? 1 : -1
    return b.points - a.points
  })

  return { type: 'placeMeld', cardIds: candidates[0].cardIds }
}

/**
 * Find the best add-to-meld action for the AI.
 * Prioritises completing canastas (melds with 6 cards → 7).
 * In partnership mode, also considers adding to partner's melds.
 */
function findBestAddToMeld(player: Player, partner?: Player): AIAction | null {
  const hand = player.hand

  type Candidate = { cardId: string; meldIndex: number; priority: number; ownerId: string }
  const candidates: Candidate[] = []

  // Check own melds
  for (let i = 0; i < player.melds.length; i++) {
    const meld = player.melds[i]
    const meldSize = meld.naturals.length + meld.wilds.length

    for (const card of hand) {
      if (canAddToMeld(meld, card)) {
        const priority = meldSize >= 6 ? 100 : meldSize >= 4 ? 50 : 10
        candidates.push({ cardId: card.id, meldIndex: i, priority, ownerId: player.id })
      }
    }
  }

  // In partnership: also check partner's melds (higher priority — cooperative play)
  if (partner) {
    for (let i = 0; i < partner.melds.length; i++) {
      const meld = partner.melds[i]
      const meldSize = meld.naturals.length + meld.wilds.length

      for (const card of hand) {
        if (canAddToMeld(meld, card)) {
          // Boost priority for partner's melds near canasta (cooperative strategy)
          const priority = meldSize >= 6 ? 120 : meldSize >= 4 ? 60 : 15
          candidates.push({ cardId: card.id, meldIndex: i, priority, ownerId: partner.id })
        }
      }
    }
  }

  if (candidates.length === 0) return null
  candidates.sort((a, b) => b.priority - a.priority)

  return {
    type: 'addToMeld',
    cardIds: [candidates[0].cardId],
    meldIndex: candidates[0].meldIndex,
    playerId: candidates[0].ownerId,
  }
}

// ─── Discard choice ───────────────────────────────────────────────────────────

function buildDiscard(player: Player, difficulty: AIDifficulty): AIAction {
  const cardId = chooseDiscard(player, difficulty)
  return { type: 'discard', cardId }
}

function chooseDiscard(player: Player, difficulty: AIDifficulty): string {
  const hand = player.hand
  const discardable = hand.filter(c => !isRed3(c))

  // Fallback: discard first card if nothing else works
  if (discardable.length === 0) return hand[0]?.id ?? ''

  if (difficulty === 'beginner') {
    return discardable[Math.floor(Math.random() * discardable.length)].id
  }

  if (difficulty === 'easy') {
    // Discard highest value card (not very smart)
    return [...discardable].sort(
      (a, b) => cardPointValue(b) - cardPointValue(a),
    )[0].id
  }

  // medium / hard / expert: discard least-useful card
  const scored = discardable.map(card => ({
    card,
    usefulness: scoreUsefulness(card, hand, player),
  }))
  scored.sort((a, b) => a.usefulness - b.usefulness)

  // hard/expert: also prefer to discard wilds to freeze pile (occasionally)
  if ((difficulty === 'hard' || difficulty === 'expert') && Math.random() < 0.15) {
    const wildCard = discardable.find(isWild)
    if (wildCard) return wildCard.id
  }

  // neural: discard black 3s first (optimal pile blocking), then lowest-usefulness card
  if (difficulty === 'neural') {
    const black3 = discardable.find(isBlack3)
    if (black3) return black3.id
    // Avoid discarding wilds or cards that match existing melds
    const nonWildScored = scored.filter(s => !isWild(s.card))
    if (nonWildScored.length > 0) return nonWildScored[0].card.id
  }

  return scored[0].card.id
}

/** Score how useful a card is to keep (higher = keep it). */
function scoreUsefulness(card: Card, hand: Card[], player: Player): number {
  if (isWild(card)) return 10000
  if (isRed3(card)) return 999999 // can't discard anyway
  if (isBlack3(card)) return -10 // good to discard (blocks pile)

  let score = cardPointValue(card)

  // Matches an existing meld rank → very useful
  if (player.melds.some(m => m.rank === card.rank)) score += 200

  // Multiple copies in hand → potential new meld
  const sameRank = hand.filter(c => c.rank === card.rank && !isWild(c))
  if (sameRank.length >= 3) score += 150
  else if (sameRank.length >= 2) score += 75
  else if (sameRank.length >= 1) score += 25

  return score
}

// Re-export for tests
export { findBestNewMeld as _findBestNewMeld, findBestAddToMeld as _findBestAddToMeld }

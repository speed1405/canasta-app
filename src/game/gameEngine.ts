import type {
  GameState,
  Variant,
  AIDifficulty,
  Player,
  Card,
  GamePhase,
} from './types'
import { isRed3, isWild, isBlack3, minimumMeldPoints } from './types'
import { dealHands, drawFromStock } from './deck'
import { addCards, removeCards, sortHand } from './hand'
import { buildMeld, addToMeld, canAddToMeld } from './meld'
import {
  createPile,
  discardCard,
  pickUpPile as pickUpPileFromPile,
  beginTurn,
} from './pile'
import { calculateRoundScore, canGoOut } from './scoring'
import {
  validateDrawFromStock,
  validatePickUpPile,
  validateNewMeld,
  validateAddToMeld,
  validateDiscard,
} from './rules'

// ─── initGame ─────────────────────────────────────────────────────────────────

export function initGame(
  variant: Variant,
  difficulty: AIDifficulty,
  numPlayers: number,
): { state: GameState; difficulty: AIDifficulty } {
  const players: Player[] = [
    {
      id: 'human',
      name: 'You',
      type: 'human',
      hand: [],
      melds: [],
      red3s: [],
      hasOpenedMelds: false,
      score: 0,
    },
  ]

  for (let i = 1; i < numPlayers; i++) {
    players.push({
      id: `ai-${i}`,
      name: `AI ${i}`,
      type: 'ai',
      hand: [],
      melds: [],
      red3s: [],
      hasOpenedMelds: false,
      score: 0,
    })
  }

  const { hands, stock: dealtStock } = dealHands(variant, numPlayers)
  players.forEach((p, i) => {
    p.hand = sortHand(hands[i])
  })

  // Flip the first stock card to start the discard pile
  let stockCards = dealtStock
  let firstCard = stockCards[0]
  stockCards = stockCards.slice(1)

  // If the first card is a wild, keep drawing until we find a non-wild
  while (isWild(firstCard) && stockCards.length > 0) {
    stockCards = [...stockCards, firstCard] // put it back at the end
    firstCard = stockCards[0]
    stockCards = stockCards.slice(1)
  }

  const pile = discardCard(createPile(), firstCard)

  let state: GameState = {
    variant,
    players,
    currentPlayerIndex: 0,
    stock: stockCards,
    pile,
    phase: 'draw' as GamePhase,
    roundScores: [],
    matchOver: false,
  }

  // Auto-place red 3s from initial hands
  state = processAllRed3s(state)

  return { state, difficulty }
}

// ─── applyDrawFromStock ───────────────────────────────────────────────────────

export function applyDrawFromStock(state: GameState): GameState {
  const result = validateDrawFromStock(state.stock)
  if (!result.ok) return state

  const playerIndex = state.currentPlayerIndex
  const player = state.players[playerIndex]

  // Draw up to 2 cards
  const drawCount = Math.min(2, state.stock.length)
  const { drawn, remaining } = drawFromStock(state.stock, drawCount)

  let hand = [...player.hand]
  let red3s = [...player.red3s]
  let stock = remaining

  // Process drawn cards: auto-place red 3s and draw replacements
  for (const card of drawn) {
    if (isRed3(card)) {
      red3s = [...red3s, card]
      // Draw a replacement
      if (stock.length > 0) {
        const [replacement, ...restStock] = stock
        stock = restStock
        // Replacement might also be a red 3 — handled by processAllRed3s after
        hand = [...hand, replacement]
      }
    } else {
      hand = [...hand, card]
    }
  }

  const updatedPlayer: Player = { ...player, hand: sortHand(hand), red3s }
  const players = state.players.map((p, i) =>
    i === playerIndex ? updatedPlayer : p,
  )

  let nextState: GameState = {
    ...state,
    players,
    stock,
    phase: 'meld',
  }

  // Process any red 3s that sneaked in as replacements
  nextState = processAllRed3s(nextState)

  // If stock is now empty after drawing, note it (round end handled on discard)
  return nextState
}

// ─── applyPickUpPile ──────────────────────────────────────────────────────────

export function applyPickUpPile(state: GameState): GameState {
  const playerIndex = state.currentPlayerIndex
  const player = state.players[playerIndex]

  const result = validatePickUpPile(state.pile, player.hand, player.melds)
  if (!result.ok) return state

  const { taken, newPile } = pickUpPileFromPile(state.pile)
  const updatedPlayer: Player = {
    ...player,
    hand: sortHand(addCards(player.hand, taken)),
  }
  const players = state.players.map((p, i) =>
    i === playerIndex ? updatedPlayer : p,
  )

  return { ...state, players, pile: newPile, phase: 'meld' }
}

// ─── applyPlaceMeld ───────────────────────────────────────────────────────────

export function applyPlaceMeld(
  state: GameState,
  playerId: string,
  cardIds: string[],
): GameState {
  const playerIndex = state.players.findIndex(p => p.id === playerId)
  if (playerIndex === -1) return state

  const player = state.players[playerIndex]
  const cards = cardIds
    .map(id => player.hand.find(c => c.id === id))
    .filter((c): c is Card => c !== undefined)

  if (cards.length !== cardIds.length) return state

  const result = validateNewMeld(cards, player, state.variant)
  if (!result.ok) return state

  const newMeld = buildMeld(cards)
  const updatedHand = removeCards(player.hand, cardIds)
  const updatedPlayer: Player = {
    ...player,
    hand: updatedHand,
    melds: [...player.melds, newMeld],
    hasOpenedMelds: true,
  }
  const players = state.players.map((p, i) =>
    i === playerIndex ? updatedPlayer : p,
  )

  const nextState = { ...state, players }

  // Check if player went out by melding all cards
  if (updatedPlayer.hand.length === 0 && canGoOut(updatedPlayer)) {
    return { ...nextState, phase: 'end' }
  }

  return nextState
}

// ─── applyAddToMeld ───────────────────────────────────────────────────────────

export function applyAddToMeld(
  state: GameState,
  playerId: string,
  cardIds: string[],
  meldIndex: number,
): GameState {
  const playerIndex = state.players.findIndex(p => p.id === playerId)
  if (playerIndex === -1) return state

  const player = state.players[playerIndex]
  if (meldIndex < 0 || meldIndex >= player.melds.length) return state

  const cards = cardIds
    .map(id => player.hand.find(c => c.id === id))
    .filter((c): c is Card => c !== undefined)

  if (cards.length !== cardIds.length) return state

  const meld = player.melds[meldIndex]
  const result = validateAddToMeld(cards, meld)
  if (!result.ok) return state

  let updatedMeld = meld
  for (const card of cards) {
    updatedMeld = addToMeld(updatedMeld, card)
  }

  const updatedMelds = player.melds.map((m, i) =>
    i === meldIndex ? updatedMeld : m,
  )
  const updatedHand = removeCards(player.hand, cardIds)
  const updatedPlayer: Player = {
    ...player,
    hand: updatedHand,
    melds: updatedMelds,
  }
  const players = state.players.map((p, i) =>
    i === playerIndex ? updatedPlayer : p,
  )

  const nextState = { ...state, players }

  // Check if player went out by adding last cards to a meld
  if (updatedPlayer.hand.length === 0 && canGoOut(updatedPlayer)) {
    return { ...nextState, phase: 'end' }
  }

  return nextState
}

// ─── applyDiscard ─────────────────────────────────────────────────────────────

export function applyDiscard(
  state: GameState,
  playerId: string,
  cardId: string,
): GameState {
  const playerIndex = state.players.findIndex(p => p.id === playerId)
  if (playerIndex === -1) return state

  const player = state.players[playerIndex]
  const card = player.hand.find(c => c.id === cardId)
  if (!card) return state

  const result = validateDiscard(card)
  if (!result.ok) return state

  const updatedHand = removeCards(player.hand, [cardId])
  const updatedPile = discardCard(state.pile, card)
  const updatedPlayer: Player = { ...player, hand: updatedHand }

  const players = state.players.map((p, i) =>
    i === playerIndex ? updatedPlayer : p,
  )

  // Check going out: hand empty AND has canasta
  const wentOut = updatedHand.length === 0 && canGoOut(updatedPlayer)

  if (wentOut) {
    return {
      ...state,
      players,
      pile: updatedPile,
      phase: 'end',
      // currentPlayerIndex unchanged — points to who went out
    }
  }

  // If stock is empty, round also ends
  if (state.stock.length === 0) {
    return {
      ...state,
      players,
      pile: updatedPile,
      phase: 'end',
    }
  }

  // Advance to next player
  const nextIndex = (playerIndex + 1) % state.players.length
  return {
    ...state,
    players,
    pile: beginTurn(updatedPile),
    currentPlayerIndex: nextIndex,
    phase: 'draw',
  }
}

// ─── applyEndRound ────────────────────────────────────────────────────────────

export function applyEndRound(
  state: GameState,
  goingOutPlayerId: string | null,
): GameState {
  const totalRed3Count = state.players.reduce(
    (sum, p) => sum + p.red3s.length,
    0,
  )

  const roundScoreEntry: Record<string, number> = {}

  let players = state.players.map(player => {
    const wentOut = player.id === goingOutPlayerId
    const wentOutConcealed = wentOut && !player.hasOpenedMelds
    const details = calculateRoundScore(player, {
      wentOut,
      wentOutConcealed,
      totalRed3Count,
    })
    roundScoreEntry[player.id] = details.total
    return { ...player, score: player.score + details.total }
  })

  const roundScores = [...state.roundScores, roundScoreEntry]
  const matchOver = players.some(p => p.score >= 5000)

  if (matchOver) {
    return { ...state, players, roundScores, matchOver: true, phase: 'end' }
  }

  // Reset for next round
  const { hands, stock: newStockCards } = dealHands(
    state.variant,
    players.length,
  )
  players = players.map((p, i) => ({
    ...p,
    hand: sortHand(hands[i]),
    melds: [],
    red3s: [],
    hasOpenedMelds: false,
  }))

  // Flip first stock card for the new discard pile
  let stockCards = newStockCards
  let firstCard = stockCards[0]
  stockCards = stockCards.slice(1)

  while (isWild(firstCard) && stockCards.length > 0) {
    stockCards = [...stockCards, firstCard]
    firstCard = stockCards[0]
    stockCards = stockCards.slice(1)
  }

  const newPile = discardCard(createPile(), firstCard)

  // Next round starts with the player after who went out
  const prevIndex = goingOutPlayerId
    ? state.players.findIndex(p => p.id === goingOutPlayerId)
    : state.currentPlayerIndex
  const startingIndex = (prevIndex + 1) % players.length

  let nextState: GameState = {
    ...state,
    players,
    stock: stockCards,
    pile: newPile,
    currentPlayerIndex: startingIndex,
    phase: 'draw',
    roundScores,
    matchOver: false,
  }

  // Process initial red 3s in new hands
  nextState = processAllRed3s(nextState)

  return nextState
}

// ─── getHint ─────────────────────────────────────────────────────────────────

export function getHint(state: GameState): string {
  const player = state.players[state.currentPlayerIndex]

  if (state.phase === 'draw') {
    if (state.pile.cards.length > 0 && !state.pile.blockedOneTurn) {
      const result = validatePickUpPile(state.pile, player.hand, player.melds)
      if (result.ok && state.pile.cards.length >= 5) {
        return `Pick up the pile (${state.pile.cards.length} cards) to gain a big advantage!`
      }
    }
    if (state.stock.length <= 5) {
      return `Stock is almost empty (${state.stock.length} cards). Plan your moves carefully.`
    }
    return 'Draw 2 cards from the stock pile to start your turn.'
  }

  if (state.phase === 'meld') {
    if (canGoOut(player) && player.hand.length <= 2) {
      return 'You have a canasta — consider going out by discarding your last card!'
    }

    // Check for near-canasta melds
    for (const meld of player.melds) {
      const size = meld.naturals.length + meld.wilds.length
      if (size >= 6) {
        const canAdd = player.hand.some(c => canAddToMeld(meld, c))
        if (canAdd) {
          return `Add one more card to your ${meld.rank} meld to complete a canasta!`
        }
      }
    }

    // Check for possible new melds
    const rankCounts = new Map<string, number>()
    for (const card of player.hand) {
      if (!isWild(card) && !isRed3(card) && !isBlack3(card)) {
        rankCounts.set(card.rank, (rankCounts.get(card.rank) ?? 0) + 1)
      }
    }
    for (const [rank, count] of rankCounts) {
      if (count >= 3 && !player.melds.some(m => m.rank === rank)) {
        return `You have ${count} ${rank}s — you can meld them!`
      }
    }

    if (!player.hasOpenedMelds) {
      const minPts = minimumMeldPoints(player.score)
      return `You need at least ${minPts} points to open your first meld (score: ${player.score}).`
    }

    return "Select a card to discard and end your turn, or place a meld first."
  }

  return 'Make your move!'
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Auto-place red 3s from all players' hands, drawing replacements from stock. */
function processAllRed3s(state: GameState): GameState {
  let stock = [...state.stock]
  const players = state.players.map(player => {
    const result = processPlayerRed3s(player, stock)
    stock = result.stock
    return result.player
  })
  return { ...state, players, stock }
}

function processPlayerRed3s(
  player: Player,
  stock: Card[],
): { player: Player; stock: Card[] } {
  let hand = [...player.hand]
  let red3s = [...player.red3s]
  let remainingStock = [...stock]

  // Iterate until no more red 3s in hand
  let iterations = 0
  while (iterations < 10) {
    const red3sInHand = hand.filter(isRed3)
    if (red3sInHand.length === 0) break
    iterations++

    hand = hand.filter(c => !isRed3(c))
    red3s = [...red3s, ...red3sInHand]

    const drawCount = Math.min(red3sInHand.length, remainingStock.length)
    hand = [...hand, ...remainingStock.slice(0, drawCount)]
    remainingStock = remainingStock.slice(drawCount)
  }

  return {
    player: { ...player, hand: sortHand(hand), red3s },
    stock: remainingStock,
  }
}

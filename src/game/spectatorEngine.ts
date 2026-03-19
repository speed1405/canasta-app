import type { GameState, AIDifficulty, Player } from './types'
import { isWild, isBlack3 } from './types'
import { getAIAction, type AIAction } from './ai'
import {
  initGame,
  applyDrawFromStock,
  applyPickUpPile,
  applyPlaceMeld,
  applyAddToMeld,
  applyDiscard,
  applyEndRound,
} from './gameEngine'
import { topCard } from './pile'
import { canGoOut } from './scoring'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpectatorMove {
  playerIndex: number
  playerName: string
  action: AIAction
  explanation: string
}

export interface SpectatorState {
  gameState: GameState
  difficulties: [AIDifficulty, AIDifficulty]
  moveHistory: SpectatorMove[]
  lastMove: SpectatorMove | null
  roundNumber: number
  isOver: boolean
  /** Id of the player who caused the current round to end (null = stock ran out). */
  goingOutPlayerId: string | null
}

// ─── Initialisation ───────────────────────────────────────────────────────────

/**
 * Initialise a spectator game where both players are controlled by the AI.
 * Reuses the existing initGame logic but overrides player metadata so that
 * both participants are labelled as AI.
 *
 * Note: Spectator mode runs a 2-player game for clarity regardless of the
 * variant passed to initGame internally.
 */
export function initSpectatorGame(
  difficulty1: AIDifficulty,
  difficulty2: AIDifficulty,
): SpectatorState {
  // Spectator mode only supports 2-player for clarity
  const { state } = initGame('2p', difficulty1, 2)

  // Override names and types — keep existing ids ('human', 'ai-1') so that
  // all engine functions that reference player ids still work correctly.
  const players: Player[] = state.players.map((p, i) => ({
    ...p,
    name: i === 0 ? 'AI Blue' : 'AI Red',
    type: 'ai' as const,
  }))

  return {
    gameState: { ...state, players },
    difficulties: [difficulty1, difficulty2],
    moveHistory: [],
    lastMove: null,
    roundNumber: 1,
    isOver: false,
    goingOutPlayerId: null,
  }
}

// ─── Explanation generation ───────────────────────────────────────────────────

/**
 * Produce a human-readable, educational explanation of the AI's chosen action.
 * Called *before* the action is applied so that the current hand state is
 * still intact and we can inspect the cards that are about to move.
 */
export function getActionExplanation(
  action: AIAction,
  gameState: GameState,
  playerIndex: number,
): string {
  const player = gameState.players[playerIndex]
  const name = player.name

  switch (action.type) {
    case 'drawStock': {
      const pileSize = gameState.pile.cards.length
      if (pileSize === 0) {
        return `${name} drew 2 cards from the stock — the discard pile is empty.`
      }
      if (gameState.pile.blockedOneTurn) {
        return `${name} drew from stock — the pile is blocked by a Black 3 and cannot be picked up this turn.`
      }
      if (gameState.pile.frozen) {
        return `${name} drew from stock — the pile is frozen (a wild was discarded onto it), requiring two natural matching cards to pick it up.`
      }
      return `${name} drew 2 cards from the stock. The pile (${pileSize} cards) wasn't worth picking up right now.`
    }

    case 'pickUpPile': {
      const top = topCard(gameState.pile)
      const count = gameState.pile.cards.length
      return (
        `${name} picked up the discard pile (${count} cards)! ` +
        `The top card is ${top ? `${top.rank}${top.suit ? ' of ' + top.suit : ''}` : '?'}, ` +
        `which matches cards already in hand to form or extend a meld.`
      )
    }

    case 'placeMeld': {
      const cards = action.cardIds
        .map(id => player.hand.find(c => c.id === id))
        .filter((c): c is NonNullable<typeof c> => c !== undefined)
      if (cards.length === 0) return `${name} placed a new meld.`
      const rank = cards.find(c => !isWild(c))?.rank ?? '?'
      const wilds = cards.filter(c => isWild(c)).length
      const wildNote = wilds > 0
        ? ` using ${wilds} wild card${wilds > 1 ? 's' : ''} (mixed meld)`
        : ' with all natural cards (pure meld)'
      const openingNote = !player.hasOpenedMelds ? ' This is their opening meld!' : ''
      return (
        `${name} melded ${cards.length} ${rank}s${wildNote}.` +
        ` Three or more of the same rank form a meld — the first step toward a canasta.${openingNote}`
      )
    }

    case 'addToMeld': {
      const card = player.hand.find(c => c.id === action.cardIds[0])
      const meldOwner = gameState.players.find(p => p.id === action.playerId)
      const meld = meldOwner?.melds[action.meldIndex]
      if (!meld || !card) return `${name} added a card to an existing meld.`
      const currentSize = meld.naturals.length + meld.wilds.length
      const newSize = currentSize + 1
      if (newSize >= 7) {
        return (
          `${name} added ${card.rank} to the ${meld.rank} meld — ` +
          `completing a CANASTA! A canasta (7+ cards) earns a 300–500 point bonus.`
        )
      }
      return (
        `${name} added ${card.rank} to the ${meld.rank} meld ` +
        `(now ${newSize}/7 cards toward a canasta).`
      )
    }

    case 'discard': {
      const card = player.hand.find(c => c.id === action.cardId)
      if (!card) return `${name} discarded a card to end their turn.`
      if (isBlack3(card)) {
        return (
          `${name} discarded a Black 3 of ${card.suit ?? '?'}. ` +
          `Black 3s are great discards — they block the opponent from picking up the pile next turn!`
        )
      }
      if (isWild(card)) {
        return (
          `${name} discarded a ${card.rank === 'Joker' ? 'Joker' : '2 (wild)'}. ` +
          `Discarding a wild card permanently freezes the discard pile, ` +
          `making it much harder for the opponent to pick it up.`
        )
      }
      // Determine reason
      const matchesMeld = player.melds.some(m => m.rank === card.rank)
      if (matchesMeld) {
        return (
          `${name} discarded ${card.rank} of ${card.suit ?? '?'} — ` +
          `even though it matches a meld, all other cards are more valuable to keep right now.`
        )
      }
      const sameRankCount = player.hand.filter(c => c.rank === card.rank && !isWild(c)).length
      if (sameRankCount <= 1) {
        return (
          `${name} discarded ${card.rank} of ${card.suit ?? '?'} — ` +
          `a lone card with no matching partners in hand and no existing meld to extend.`
        )
      }
      return (
        `${name} discarded ${card.rank} of ${card.suit ?? '?'} — ` +
        `the least-useful card in hand this turn.`
      )
    }

    case 'goOut': {
      if (action.discardCardId) {
        const card = player.hand.find(c => c.id === action.discardCardId)
        return (
          `${name} went out by discarding ${card ? card.rank + ' of ' + (card.suit ?? '?') : 'a card'}! ` +
          `Going out requires at least one complete canasta and discarding (or melding) all remaining cards. ` +
          `The round ends and scoring begins.`
        )
      }
      return (
        `${name} went out — all cards melded with a canasta complete! ` +
        `Going out with no discard earns an extra concealed-hand bonus if no melds were laid down previously.`
      )
    }
  }
}

// ─── Action application ───────────────────────────────────────────────────────

/**
 * Apply a single AI action to the game state.
 * Returns the updated GameState.
 */
function applyAIAction(gameState: GameState, action: AIAction): GameState {
  const player = gameState.players[gameState.currentPlayerIndex]

  switch (action.type) {
    case 'drawStock':
      return applyDrawFromStock(gameState)

    case 'pickUpPile':
      return applyPickUpPile(gameState)

    case 'placeMeld':
      return applyPlaceMeld(gameState, player.id, action.cardIds)

    case 'addToMeld':
      return applyAddToMeld(gameState, action.playerId, action.cardIds, action.meldIndex)

    case 'discard':
      return applyDiscard(gameState, player.id, action.cardId)

    case 'goOut': {
      if (action.discardCardId) {
        // Discarding the last card — applyDiscard will detect the empty hand + canasta
        return applyDiscard(gameState, player.id, action.discardCardId)
      }
      // Hand already empty — signal round end directly
      return { ...gameState, phase: 'end' }
    }
  }
}

// ─── Step function ────────────────────────────────────────────────────────────

/**
 * Advance the spectator game by exactly one AI action.
 *
 * - If the round just ended (`phase === 'end'`), start the next round (or mark
 *   the match as over).
 * - Otherwise: ask the current player's AI for an action, generate an
 *   explanation, apply it, and return the updated state.
 */
export function stepSpectator(state: SpectatorState): SpectatorState {
  if (state.isOver) return state

  const { gameState } = state

  // ── Handle round / match end ────────────────────────────────────────────────
  if (gameState.phase === 'end') {
    if (gameState.matchOver) {
      return { ...state, isOver: true }
    }

    // Determine who went out: player with an empty hand that can go out
    const goingOutPlayer =
      gameState.players.find(
        p => p.hand.length === 0 && canGoOut(p),
      ) ?? null

    const newGameState = applyEndRound(gameState, goingOutPlayer?.id ?? null)

    const roundSummaryMove: SpectatorMove = {
      playerIndex: -1,
      playerName: 'Round End',
      action: { type: 'drawStock' }, // placeholder
      explanation:
        `Round ${state.roundNumber} complete! ` +
        (goingOutPlayer
          ? `${goingOutPlayer.name} went out and triggered scoring.`
          : `The stock pile ran out — round ends without a go-out.`) +
        ` Scores: AI Blue ${gameState.players[0].score} — AI Red ${gameState.players[1].score}.`,
    }

    return {
      ...state,
      gameState: newGameState,
      roundNumber: state.roundNumber + 1,
      lastMove: roundSummaryMove,
      moveHistory: [...state.moveHistory, roundSummaryMove],
      goingOutPlayerId: goingOutPlayer?.id ?? null,
      isOver: newGameState.matchOver,
    }
  }

  // ── Normal AI turn ──────────────────────────────────────────────────────────
  const playerIndex = gameState.currentPlayerIndex
  // difficulties is a 2-tuple; for a 2-player game playerIndex is always 0 or 1
  const difficulty = state.difficulties[playerIndex as 0 | 1] ?? state.difficulties[0]
  const player = gameState.players[playerIndex]

  const action = getAIAction(gameState, difficulty)
  const explanation = getActionExplanation(action, gameState, playerIndex)
  const newGameState = applyAIAction(gameState, action)

  // Detect if the player went out (hand became empty + has canasta)
  const updatedPlayer = newGameState.players[playerIndex]
  const wentOut =
    action.type === 'goOut' ||
    (updatedPlayer.hand.length === 0 && canGoOut(updatedPlayer))

  const move: SpectatorMove = {
    playerIndex,
    playerName: player.name,
    action,
    explanation,
  }

  return {
    ...state,
    gameState: newGameState,
    moveHistory: [...state.moveHistory, move],
    lastMove: move,
    goingOutPlayerId: wentOut ? player.id : state.goingOutPlayerId,
    isOver: newGameState.matchOver,
  }
}

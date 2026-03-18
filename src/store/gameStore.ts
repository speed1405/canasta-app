import { create } from 'zustand'
import type { GameState, AIDifficulty, Variant } from '../game/types'
import { calculateRoundScore, canGoOut } from '../game/scoring'
import { validatePickUpPile } from '../game/rules'
import { getAIAction } from '../game/ai'
import {
  initGame,
  applyDrawFromStock,
  applyPickUpPile,
  applyPlaceMeld,
  applyAddToMeld,
  applyDiscard,
  applyEndRound,
  getHint,
} from '../game/gameEngine'
import { recordGame, createGameRecord } from '../game/stats'
import { playDeal, playDiscard, playMeld, playCanasta, playGoOut, playInvalid } from '../game/soundManager'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoundEndData {
  roundNumber: number
  scores: {
    playerId: string
    name: string
    roundScore: number
    totalScore: number
  }[]
  matchOver: boolean
  winner?: string
}

interface GameStore {
  gameState: GameState | null
  difficulty: AIDifficulty
  selectedCardIds: Set<string>
  hint: string
  lastError: string
  roundEndData: RoundEndData | null
  gameStartTimeMs: number

  startGame: (variant: Variant, difficulty: AIDifficulty) => void
  selectCard: (cardId: string) => void
  deselectAll: () => void
  drawFromStock: () => void
  pickUpPile: () => void
  placeMeld: () => void
  addToExistingMeld: (meldIndex: number, playerId: string) => void
  discardSelected: () => void
  requestHint: () => void
  acknowledgeRoundEnd: () => void
  triggerAITurn: () => void
}

// ─── Helper: compute round-end display data ───────────────────────────────────

function computeRoundEndData(
  state: GameState,
  goingOutPlayerId: string | null,
): RoundEndData {
  const totalRed3Count = state.players.reduce(
    (sum, p) => sum + p.red3s.length,
    0,
  )

  const scores = state.players.map(player => {
    const wentOut = player.id === goingOutPlayerId
    const details = calculateRoundScore(player, {
      wentOut,
      wentOutConcealed: wentOut && !player.hasOpenedMelds,
      totalRed3Count,
    })
    return {
      playerId: player.id,
      name: player.name,
      roundScore: details.total,
      totalScore: player.score + details.total,
    }
  })

  const maxTotal = Math.max(...scores.map(s => s.totalScore))
  const matchOver = maxTotal >= 5000

  return {
    roundNumber: state.roundScores.length + 1,
    scores,
    matchOver,
    winner: matchOver
      ? scores.find(s => s.totalScore === maxTotal)?.name
      : undefined,
  }
}

/** Detect who went out (empty hand + canasta) in a state where phase === 'end'. */
function detectGoingOutPlayer(state: GameState): string | null {
  const player = state.players.find(
    p => p.hand.length === 0 && canGoOut(p),
  )
  return player?.id ?? null
}

/** Returns true if a new canasta (7+ card meld) was completed in newState vs oldState. */
function hasNewCanasta(oldState: GameState, newState: GameState): boolean {
  const countCanastas = (s: GameState) =>
    s.players.flatMap(p => p.melds).filter(m => m.naturals.length + m.wilds.length >= 7).length
  return countCanastas(newState) > countCanastas(oldState)
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  difficulty: 'easy',
  selectedCardIds: new Set<string>(),
  hint: '',
  lastError: '',
  roundEndData: null,
  gameStartTimeMs: 0,

  startGame: (variant, difficulty) => {
    const numPlayers = variant === '2p' ? 2 : 3
    const { state } = initGame(variant, difficulty, numPlayers)
    set({
      gameState: state,
      difficulty,
      selectedCardIds: new Set(),
      hint: '',
      lastError: '',
      roundEndData: null,
      gameStartTimeMs: Date.now(),
    })
    // If the first player is AI, trigger their turn
    if (state.players[state.currentPlayerIndex].type === 'ai') {
      setTimeout(() => get().triggerAITurn(), 700)
    }
  },

  selectCard: (cardId) => {
    const { selectedCardIds } = get()
    const next = new Set(selectedCardIds)
    if (next.has(cardId)) {
      next.delete(cardId)
    } else {
      next.add(cardId)
    }
    set({ selectedCardIds: next, lastError: '' })
  },

  deselectAll: () => set({ selectedCardIds: new Set(), lastError: '' }),

  drawFromStock: () => {
    const { gameState } = get()
    if (!gameState) return
    if (gameState.phase !== 'draw') {
      set({ lastError: 'You must be in the draw phase to draw.' })
      return
    }
    const player = gameState.players[gameState.currentPlayerIndex]
    if (player.type !== 'human') return

    const newState = applyDrawFromStock(gameState)
    if (newState === gameState) {
      set({ lastError: 'Stock is empty — cannot draw.' })
      return
    }
    playDeal()
    set({ gameState: newState, lastError: '', hint: '' })
  },

  pickUpPile: () => {
    const { gameState } = get()
    if (!gameState) return
    if (gameState.phase !== 'draw') {
      set({ lastError: 'You must be in the draw phase to pick up the pile.' })
      return
    }
    const player = gameState.players[gameState.currentPlayerIndex]
    if (player.type !== 'human') return

    const newState = applyPickUpPile(gameState)
    if (newState === gameState) {
      const result = validatePickUpPile(gameState.pile, player.hand, player.melds)
      set({ lastError: result.ok ? 'Cannot pick up pile.' : result.reason })
      return
    }
    playDeal()
    set({ gameState: newState, lastError: '', hint: '' })
  },

  placeMeld: () => {
    const { gameState, selectedCardIds } = get()
    if (!gameState) return
    if (gameState.phase !== 'meld') {
      set({ lastError: 'You can only meld after drawing.' })
      return
    }
    const player = gameState.players[gameState.currentPlayerIndex]
    if (player.type !== 'human') return

    const cardIds = [...selectedCardIds]
    const newState = applyPlaceMeld(gameState, player.id, cardIds)
    if (newState === gameState) {
      playInvalid()
      set({ lastError: 'Invalid meld — check card count, rank, and wild limits.' })
      return
    }

    if (newState.phase === 'end') {
      playGoOut()
      handleRoundEnd(newState, set)
      return
    }
    hasNewCanasta(gameState, newState) ? playCanasta() : playMeld()
    set({ gameState: newState, selectedCardIds: new Set(), lastError: '', hint: '' })
  },

  addToExistingMeld: (meldIndex, playerId) => {
    const { gameState, selectedCardIds } = get()
    if (!gameState) return
    if (gameState.phase !== 'meld') {
      set({ lastError: 'You can only add to melds after drawing.' })
      return
    }
    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    if (currentPlayer.type !== 'human') return

    const cardIds = [...selectedCardIds]
    const newState = applyAddToMeld(gameState, playerId, cardIds, meldIndex)
    if (newState === gameState) {
      playInvalid()
      set({ lastError: 'Cannot add those cards to that meld.' })
      return
    }

    if (newState.phase === 'end') {
      playGoOut()
      handleRoundEnd(newState, set)
      return
    }
    hasNewCanasta(gameState, newState) ? playCanasta() : playMeld()
    set({ gameState: newState, selectedCardIds: new Set(), lastError: '', hint: '' })
  },

  discardSelected: () => {
    const { gameState, selectedCardIds } = get()
    if (!gameState) return
    if (gameState.phase !== 'meld') {
      set({ lastError: 'You must draw before discarding.' })
      return
    }
    const player = gameState.players[gameState.currentPlayerIndex]
    if (player.type !== 'human') return

    if (selectedCardIds.size !== 1) {
      set({ lastError: 'Select exactly one card to discard.' })
      return
    }

    const [cardId] = selectedCardIds
    const newState = applyDiscard(gameState, player.id, cardId)
    if (newState === gameState) {
      playInvalid()
      set({ lastError: 'Cannot discard that card.' })
      return
    }

    if (newState.phase === 'end') {
      playGoOut()
      handleRoundEnd(newState, set)
      return
    }

    playDiscard()
    set({ gameState: newState, selectedCardIds: new Set(), lastError: '', hint: '' })

    // Trigger AI turn if next player is AI
    const nextPlayer = newState.players[newState.currentPlayerIndex]
    if (nextPlayer.type === 'ai' && newState.phase === 'draw') {
      setTimeout(() => get().triggerAITurn(), 600)
    }
  },

  requestHint: () => {
    const { gameState } = get()
    if (!gameState) return
    set({ hint: getHint(gameState) })
  },

  acknowledgeRoundEnd: () => {
    const { gameState, roundEndData, gameStartTimeMs, difficulty } = get()
    if (!gameState || !roundEndData) return

    if (roundEndData.matchOver) {
      // Record the completed match in stats
      const scores: Record<string, number> = {}
      roundEndData.scores.forEach(s => { scores[s.playerId] = s.totalScore })
      const winningEntry = roundEndData.scores.reduce((a, b) =>
        a.totalScore >= b.totalScore ? a : b
      )
      const winner: 'human' | 'ai' = winningEntry.playerId === 'human' ? 'human' : 'ai'
      const record = createGameRecord(
        gameState.variant,
        difficulty,
        winner,
        scores,
        gameState.roundScores.length + 1,
        Date.now() - gameStartTimeMs,
      )
      recordGame(record)
      set({ roundEndData: null })
      return
    }

    // Determine who went out and apply end-of-round logic
    const goingOutPlayerId = detectGoingOutPlayer(gameState)
    const newState = applyEndRound(gameState, goingOutPlayerId)
    set({
      gameState: newState,
      roundEndData: null,
      selectedCardIds: new Set(),
      hint: '',
      lastError: '',
    })

    // Trigger AI if first player is AI in new round
    const firstPlayer = newState.players[newState.currentPlayerIndex]
    if (firstPlayer.type === 'ai' && newState.phase === 'draw') {
      setTimeout(() => get().triggerAITurn(), 700)
    }
  },

  triggerAITurn: () => {
    const { gameState, difficulty } = get()
    if (!gameState) return

    const player = gameState.players[gameState.currentPlayerIndex]
    if (player.type !== 'ai') return
    if (gameState.phase === 'end') return

    let currentState = gameState
    let safetyLimit = 30 // max actions per turn (prevents infinite loops from AI bugs)

    while (safetyLimit-- > 0) {
      if (currentState.phase === 'end') break

      const aiPlayer = currentState.players[currentState.currentPlayerIndex]
      if (aiPlayer.type !== 'ai') break

      const action = getAIAction(currentState, difficulty)

      switch (action.type) {
        case 'drawStock': {
          const next = applyDrawFromStock(currentState)
          if (next === currentState) {
            // Stock empty — end round
            currentState = { ...currentState, phase: 'end' }
          } else {
            currentState = next
          }
          break
        }

        case 'pickUpPile': {
          const next = applyPickUpPile(currentState)
          currentState = next === currentState
            ? applyDrawFromStock(currentState)
            : next
          break
        }

        case 'placeMeld': {
          const next = applyPlaceMeld(currentState, aiPlayer.id, action.cardIds)
          currentState = next // if invalid, stays same (no infinite loop since AI won't retry)
          break
        }

        case 'addToMeld': {
          const next = applyAddToMeld(
            currentState,
            action.playerId,
            action.cardIds,
            action.meldIndex,
          )
          currentState = next
          break
        }

        case 'discard': {
          const next = applyDiscard(currentState, aiPlayer.id, action.cardId)
          if (next === currentState) {
            // Fallback: discard first discardable card
            const fallback = aiPlayer.hand.find(
              c => c.rank !== '3' || (c.suit !== 'hearts' && c.suit !== 'diamonds'),
            )
            if (fallback) {
              currentState = applyDiscard(currentState, aiPlayer.id, fallback.id)
            } else {
              currentState = { ...currentState, phase: 'end' }
            }
          } else {
            currentState = next
          }

          set({ gameState: currentState, selectedCardIds: new Set(), hint: '' })

          if (currentState.phase === 'end') {
            handleRoundEnd(currentState, set)
            return
          }

          // Check if next player is also AI
          const nextP = currentState.players[currentState.currentPlayerIndex]
          if (nextP.type === 'ai' && currentState.phase === 'draw') {
            setTimeout(() => get().triggerAITurn(), 500)
          }
          return
        }

        case 'goOut': {
          if (action.discardCardId) {
            const next = applyDiscard(currentState, aiPlayer.id, action.discardCardId)
            currentState = next === currentState ? currentState : next
          } else {
            // Melded all cards — no discard needed
            currentState = { ...currentState, phase: 'end' }
          }

          set({ gameState: currentState })

          if (currentState.phase === 'end') {
            handleRoundEnd(currentState, set)
          }
          return
        }
      }
    }

    // Fallback: update state
    set({ gameState: currentState })
    if (currentState.phase === 'end') {
      handleRoundEnd(currentState, set)
    }
  },
}))

// ─── Internal: handle round end ────────────────────────────────────────────────

type SetFn = (partial: Partial<GameStore>) => void

function handleRoundEnd(endState: GameState, set: SetFn) {
  const goingOutPlayerId = detectGoingOutPlayer(endState)
  const roundEndData = computeRoundEndData(endState, goingOutPlayerId)
  set({
    gameState: endState,
    roundEndData,
    selectedCardIds: new Set(),
    lastError: '',
    hint: '',
  })
}

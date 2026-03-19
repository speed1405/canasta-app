import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { subscribeToRoom, submitAction, sendChatMessage, updateRoomGameState } from '../multiplayer/roomService'
import type { MultiplayerRoom, MultiplayerAction, ChatMessage } from '../multiplayer/types'
import type { GameState } from '../game/types'
import {
  applyDrawFromStock,
  applyPickUpPile,
  applyPlaceMeld,
  applyAddToMeld,
  applyDiscard,
} from '../game/gameEngine'
import { useGameStore } from '../store/gameStore'

const TURN_TIMEOUT_MS = 60_000
const DISCONNECT_THRESHOLD_MS = 30_000

// ─── MultiplayerGame (used both as a standalone route and embedded) ───────────

interface MultiplayerGameProps {
  room?: MultiplayerRoom
  myUid?: string
  roomId?: string
}

export function MultiplayerGame({ room: propRoom, myUid: propMyUid, roomId: propRoomId }: MultiplayerGameProps) {
  const { roomId: paramRoomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const effectiveRoomId = propRoomId ?? paramRoomId ?? ''
  const effectiveMyUid = propMyUid ?? ''

  const [room, setRoom] = useState<MultiplayerRoom | null>(propRoom ?? null)
  const [chatInput, setChatInput] = useState('')
  const [turnSecondsLeft, setTurnSecondsLeft] = useState(60)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const gameState = useGameStore(s => s.gameState)

  // Subscribe to room updates
  useEffect(() => {
    if (!effectiveRoomId) return
    const unsub = subscribeToRoom(effectiveRoomId, (r) => {
      setRoom(r)
    })
    return unsub
  }, [effectiveRoomId])

  // Sync game state from Firestore into store when host updates it
  const setGameStateFromFirestore = useCallback((gs: GameState) => {
    useGameStore.setState({ gameState: gs })
  }, [])

  useEffect(() => {
    if (room?.gameState) {
      setGameStateFromFirestore(room.gameState)
    }
  }, [room?.gameState, setGameStateFromFirestore])

  // Turn timer
  const myIndex = room?.players.findIndex(p => p.uid === effectiveMyUid) ?? -1
  const isMyTurn = room != null && room.currentPlayerIndex === myIndex

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (!isMyTurn || !room || room.status !== 'in-progress') return

    setTurnSecondsLeft(60)
    timerRef.current = setInterval(() => {
      setTurnSecondsLeft(prev => {
        if (prev <= 1) {
          // Auto-discard first card
          autoDiscard()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMyTurn, myIndex, room?.currentPlayerIndex])

  function autoDiscard() {
    if (!room?.gameState || !effectiveRoomId) return
    const currentPlayer = room.gameState.players[room.currentPlayerIndex]
    if (!currentPlayer || currentPlayer.hand.length === 0) return
    const cardId = currentPlayer.hand[0].id
    submitAction(effectiveRoomId, { type: 'discard', cardId }).catch(() => null)
  }

  // Host processes pending actions
  const isHost = room?.hostId === effectiveMyUid

  useEffect(() => {
    if (!isHost || !room?.pendingAction || !room.gameState || !effectiveRoomId) return

    const action = room.pendingAction
    let newState = room.gameState

    try {
      switch (action.type) {
        case 'draw-stock':
          newState = applyDrawFromStock(newState)
          break
        case 'pick-up-pile':
          newState = applyPickUpPile(newState)
          break
        case 'place-meld': {
          const currentPlayerId = newState.players[newState.currentPlayerIndex]?.id ?? ''
          newState = applyPlaceMeld(newState, currentPlayerId, action.cardIds)
          break
        }
        case 'add-to-meld':
          newState = applyAddToMeld(
            newState,
            action.ownerPlayerId,
            action.cardIds,
            action.meldIndex,
          )
          break
        case 'discard':
          newState = applyDiscard(newState, action.cardId)
          break
      }
    } catch {
      // Invalid action — just clear the pending action
    }

    updateRoomGameState(effectiveRoomId, newState, newState.currentPlayerIndex).catch(() => null)
  }, [isHost, room?.pendingAction, effectiveRoomId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [room?.chat])

  async function handleSendChat() {
    if (!chatInput.trim() || !room || !effectiveRoomId) return
    const myDisplayName = room.players.find(p => p.uid === effectiveMyUid)?.displayName ?? 'Player'
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      uid: effectiveMyUid,
      displayName: myDisplayName,
      text: chatInput.trim(),
      timestamp: Date.now(),
    }
    setChatInput('')
    await sendChatMessage(effectiveRoomId, message).catch(() => null)
  }

  // Actions
  async function sendAction(action: MultiplayerAction) {
    if (!effectiveRoomId) return
    await submitAction(effectiveRoomId, action).catch(() => null)
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-white border-t-transparent animate-spin" />
      </div>
    )
  }

  // Post-game summary
  if (room.status === 'finished' && room.gameState) {
    const scores = room.gameState.players.map((p, i) => ({
      name: room.players[i]?.displayName ?? p.name,
      score: p.score,
    }))
    const maxScore = Math.max(...scores.map(s => s.score))

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center p-6">
        <div className="bg-white/10 rounded-2xl p-8 max-w-sm w-full space-y-6 border border-white/10 text-center">
          <div className="text-5xl">🏆</div>
          <h2 className="text-2xl font-bold">Game Over!</h2>
          <div className="space-y-2">
            {scores
              .slice()
              .sort((a, b) => b.score - a.score)
              .map((s, i) => (
                <div
                  key={i}
                  className={`flex justify-between p-3 rounded-xl ${s.score === maxScore ? 'bg-yellow-500/20 border border-yellow-500/40' : 'bg-white/5'}`}
                >
                  <span className="font-medium">{s.score === maxScore ? '🥇 ' : ''}{s.name}</span>
                  <span className="font-bold">{s.score.toLocaleString()}</span>
                </div>
              ))}
          </div>
          <button
            onClick={() => navigate('/lobby')}
            className="w-full py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-colors"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    )
  }

  const currentGs = room.gameState
  const currentPlayerName = currentGs
    ? (room.players[room.currentPlayerIndex]?.displayName ?? `Player ${room.currentPlayerIndex + 1}`)
    : ''

  // Build a Map for O(1) player game state lookup
  const gsPlayerMap = new Map(currentGs?.players.map(p => [p.id, p]) ?? [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/50 border-b border-white/10">
        <button
          onClick={() => navigate('/lobby')}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ←
        </button>
        <span className="font-bold">🌐 Multiplayer</span>
        <span className="text-slate-400 text-sm capitalize ml-2">{room.variant}</span>
        <div className="ml-auto flex items-center gap-2 text-sm">
          {isMyTurn ? (
            <span className="text-green-400 font-medium">
              ⏱ Your turn — {turnSecondsLeft}s
            </span>
          ) : (
            <span className="text-slate-400">
              ⏳ {currentPlayerName}'s turn
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main game area */}
        <div className="flex-1 overflow-auto p-4">
          {/* Player seats */}
          <div className="space-y-3 mb-6">
            {room.players.map((p, i) => {
              const isDisconnected = Date.now() - p.lastSeen > DISCONNECT_THRESHOLD_MS
              const isCurrent = room.currentPlayerIndex === i
              const playerGs = gsPlayerMap.get(p.uid)
              const handCount = playerGs?.hand.length ?? 0
              const canastasCount = playerGs?.melds.filter(m => m.naturals.length + m.wilds.length >= 7).length ?? 0

              return (
                <div
                  key={p.uid}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    isCurrent
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    isDisconnected ? 'bg-red-400 animate-pulse' : p.isConnected ? 'bg-green-400' : 'bg-slate-500'
                  }`} />
                  <span className="font-medium flex-1">
                    {p.displayName}
                    {p.uid === effectiveMyUid && ' (you)'}
                    {isDisconnected && (
                      <span className="text-xs text-red-400 ml-2">reconnecting…</span>
                    )}
                  </span>
                  <span className="text-slate-400 text-xs">{handCount} cards</span>
                  {canastasCount > 0 && (
                    <span className="text-yellow-400 text-xs">{canastasCount} canasta{canastasCount !== 1 ? 's' : ''}</span>
                  )}
                  {currentGs && (
                    <span className="text-white text-sm font-bold">
                      {gsPlayerMap.get(p.uid)?.score ?? 0}pts
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Turn controls */}
          {isMyTurn && currentGs && (
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 space-y-3">
              <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider">Your Turn</h3>
              <div className="flex flex-wrap gap-2">
                {currentGs.phase === 'draw' && (
                  <>
                    <button
                      onClick={() => sendAction({ type: 'draw-stock' })}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium text-sm transition-colors"
                    >
                      Draw from Stock
                    </button>
                    <button
                      onClick={() => sendAction({ type: 'pick-up-pile' })}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-medium text-sm transition-colors"
                    >
                      Pick Up Pile
                    </button>
                  </>
                )}
                {currentGs.phase === 'meld' && (
                  <>
                    <button
                      onClick={() => {
                        const { selectedCardIds } = useGameStore.getState()
                        sendAction({ type: 'place-meld', cardIds: Array.from(selectedCardIds) })
                      }}
                      className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 font-medium text-sm transition-colors"
                    >
                      Place Meld
                    </button>
                  </>
                )}
                {(currentGs.phase === 'meld' || currentGs.phase === 'discard') && (
                  <button
                    onClick={() => {
                      const { selectedCardIds } = useGameStore.getState()
                      const cardId = Array.from(selectedCardIds)[0]
                      if (cardId) sendAction({ type: 'discard', cardId })
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 font-medium text-sm transition-colors"
                  >
                    Discard Selected
                  </button>
                )}
              </div>
              <p className="text-slate-400 text-xs">
                Phase: <span className="text-white font-medium capitalize">{currentGs.phase}</span>
                {' · '}Timer: <span className={`font-medium ${turnSecondsLeft <= 10 ? 'text-red-400' : 'text-white'}`}>{turnSecondsLeft}s</span>
              </p>
            </div>
          )}

          {!isMyTurn && (
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center text-slate-400">
              ⏳ Waiting for <span className="text-white font-medium">{currentPlayerName}</span>…
            </div>
          )}
        </div>

        {/* Chat panel */}
        <div className="w-64 flex flex-col border-l border-white/10 bg-slate-900/30">
          <div className="px-3 py-2 border-b border-white/10 text-sm font-semibold text-slate-300">
            💬 Chat
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {room.chat.length === 0 && (
              <p className="text-slate-500 text-xs text-center mt-4">No messages yet</p>
            )}
            {room.chat.map((msg) => (
              <div key={msg.id} className={msg.uid === effectiveMyUid ? 'text-right' : ''}>
                <span className="text-xs text-slate-500">{msg.displayName}</span>
                <div
                  className={`mt-0.5 inline-block px-3 py-1.5 rounded-xl text-sm max-w-full break-words ${
                    msg.uid === effectiveMyUid
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-2 border-t border-white/10 flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSendChat() }}
              placeholder="Message…"
              maxLength={200}
              className="flex-1 bg-slate-700 rounded-xl px-3 py-1.5 text-sm text-white placeholder-slate-500 min-w-0"
            />
            <button
              onClick={handleSendChat}
              disabled={!chatInput.trim()}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-sm transition-colors"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Hand } from '../components/Hand'
import { Card } from '../components/Card'
import {
  initSpectatorGame,
  stepSpectator,
  type SpectatorState,
  type SpectatorMove,
} from '../game/spectatorEngine'
import type { AIDifficulty, Meld } from '../game/types'
import { isMeldCanasta, canastaType } from '../game/meld'
import { topCard } from '../game/pile'

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTIES: AIDifficulty[] = [
  'beginner',
  'easy',
  'medium',
  'hard',
  'expert',
  'neural',
]

const SPEED_OPTIONS = [
  { label: 'Slow', ms: 3000 },
  { label: 'Normal', ms: 1500 },
  { label: 'Fast', ms: 700 },
  { label: 'Turbo', ms: 250 },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Compact badge summary of a player's melds.
 * Each meld shows rank × count, with canasta indicators.
 */
function MeldSummary({ melds }: { melds: Meld[] }) {
  if (melds.length === 0) {
    return <p className="text-slate-500 text-xs italic">No melds yet</p>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {melds.map((meld, i) => {
        const isCanasta = isMeldCanasta(meld)
        const type = canastaType(meld)
        const size = meld.naturals.length + meld.wilds.length
        const wildLabel = meld.wilds.length > 0 ? `+${meld.wilds.length}W` : ''
        const canastaIcon = isCanasta
          ? type === 'natural'
            ? ' ⭐'
            : ' 🌟'
          : ''
        return (
          <span
            key={i}
            title={
              isCanasta
                ? `${type === 'natural' ? 'Natural' : 'Mixed'} Canasta (${size} cards)`
                : `${meld.rank} meld — ${size} cards${meld.wilds.length > 0 ? `, ${meld.wilds.length} wild` : ''}`
            }
            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              isCanasta
                ? type === 'natural'
                  ? 'bg-yellow-500 text-yellow-950'
                  : 'bg-orange-500 text-orange-950'
                : 'bg-slate-600 text-slate-200'
            }`}
          >
            {meld.rank} ×{size}
            {wildLabel}
            {canastaIcon}
          </span>
        )
      })}
    </div>
  )
}

/**
 * A single entry in the move history list.
 */
function MoveEntry({
  move,
  isLatest,
}: {
  move: SpectatorMove
  isLatest: boolean
}) {
  const isRoundEnd = move.playerIndex === -1
  return (
    <div
      className={`px-3 py-2 rounded-lg text-sm leading-snug transition-colors ${
        isLatest
          ? 'bg-blue-900/60 border border-blue-500/50 text-white'
          : isRoundEnd
            ? 'bg-slate-700/50 text-slate-300 italic'
            : 'bg-slate-800/60 text-slate-400'
      }`}
    >
      {!isRoundEnd && (
        <span
          className={`font-semibold mr-1 ${
            move.playerIndex === 0 ? 'text-blue-400' : 'text-red-400'
          }`}
        >
          {move.playerName}:
        </span>
      )}
      {move.explanation}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function Spectator() {
  const [difficulty1, setDifficulty1] = useState<AIDifficulty>('medium')
  const [difficulty2, setDifficulty2] = useState<AIDifficulty>('hard')
  const [speedIndex, setSpeedIndex] = useState(1) // Normal by default
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [spectatorState, setSpectatorState] = useState<SpectatorState>(() =>
    initSpectatorGame('medium', 'hard'),
  )

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const historyEndRef = useRef<HTMLDivElement>(null)

  // ── Actions ────────────────────────────────────────────────────────────────

  const startNewGame = useCallback(() => {
    setIsAutoPlay(false)
    setSpectatorState(initSpectatorGame(difficulty1, difficulty2))
  }, [difficulty1, difficulty2])

  const stepOnce = useCallback(() => {
    setSpectatorState(prev => stepSpectator(prev))
  }, [])

  // ── Auto-advance through round-end states ──────────────────────────────────
  // When the game phase transitions to 'end', automatically call stepSpectator
  // after a short pause so the user can see the final state before the next
  // round begins.
  useEffect(() => {
    const { phase } = spectatorState.gameState
    if (phase !== 'end' || spectatorState.isOver) return

    const timer = setTimeout(() => {
      setSpectatorState(prev => stepSpectator(prev))
    }, 1800)

    return () => clearTimeout(timer)
  }, [spectatorState.gameState.phase, spectatorState.isOver])

  // ── Auto-play interval ─────────────────────────────────────────────────────
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!isAutoPlay || spectatorState.isOver) return

    const delayMs = SPEED_OPTIONS[speedIndex].ms
    intervalRef.current = setInterval(() => {
      setSpectatorState(prev => {
        // Don't advance during round-end — the separate effect above handles it
        if (prev.isOver || prev.gameState.phase === 'end') return prev
        return stepSpectator(prev)
      })
    }, delayMs)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isAutoPlay, speedIndex, spectatorState.isOver])

  // ── Scroll history to latest move ─────────────────────────────────────────
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [spectatorState.moveHistory.length])

  // ── Derived data ───────────────────────────────────────────────────────────
  const { gameState, lastMove, moveHistory, roundNumber, isOver } = spectatorState
  const [ai1, ai2] = gameState.players
  const pileTop = topCard(gameState.pile)
  const isRoundEnd = gameState.phase === 'end'
  const currentPlayerIndex = gameState.currentPlayerIndex

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-4 flex-shrink-0">
        <Link
          to="/"
          className="text-slate-300 hover:text-white text-sm transition-colors"
          aria-label="Back to Home"
        >
          ← Home
        </Link>
        <h1 className="text-lg font-bold flex-1 text-center">
          👁️ Spectator Mode
        </h1>
        <span className="text-sm text-slate-400 whitespace-nowrap">
          Round {roundNumber}
        </span>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-3 py-4 flex flex-col gap-4">

        {/* ── Settings bar ────────────────────────────────────────────────── */}
        <section
          aria-label="Spectator settings"
          className="bg-slate-800 rounded-xl p-3 flex flex-wrap items-center gap-3"
        >
          {/* AI Blue difficulty */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="diff1"
              className="text-blue-400 font-medium text-sm whitespace-nowrap"
            >
              🤖 AI Blue:
            </label>
            <select
              id="diff1"
              value={difficulty1}
              onChange={e => setDifficulty1(e.target.value as AIDifficulty)}
              className="bg-slate-700 text-white text-sm rounded px-2 py-1 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="AI Blue difficulty"
            >
              {DIFFICULTIES.map(d => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* AI Red difficulty */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="diff2"
              className="text-red-400 font-medium text-sm whitespace-nowrap"
            >
              🤖 AI Red:
            </label>
            <select
              id="diff2"
              value={difficulty2}
              onChange={e => setDifficulty2(e.target.value as AIDifficulty)}
              className="bg-slate-700 text-white text-sm rounded px-2 py-1 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="AI Red difficulty"
            >
              {DIFFICULTIES.map(d => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-slate-400 text-sm mr-1">Speed:</span>
            {SPEED_OPTIONS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setSpeedIndex(i)}
                className={`text-xs px-2.5 py-1 rounded transition-colors ${
                  speedIndex === i
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                aria-pressed={speedIndex === i}
                aria-label={`Set speed to ${s.label}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* New Game */}
          <button
            onClick={startNewGame}
            className="px-3 py-1.5 bg-green-700 hover:bg-green-600 active:bg-green-800 text-white text-sm rounded-lg font-medium transition-colors"
            aria-label="Start a new spectator game"
          >
            🔄 New Game
          </button>
        </section>

        {/* ── Main area: game board + commentary ──────────────────────────── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">

          {/* ── Game board (2/3 on desktop) ──────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-3">

            {/* AI Blue player area */}
            <section
              aria-label="AI Blue player area"
              className={`bg-slate-800 rounded-xl p-4 border-2 transition-colors ${
                !isRoundEnd && currentPlayerIndex === 0
                  ? 'border-blue-500'
                  : 'border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold text-sm sm:text-base">
                    🤖 AI Blue
                  </span>
                  <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full capitalize">
                    {difficulty1}
                  </span>
                  {!isRoundEnd && currentPlayerIndex === 0 && (
                    <span className="text-xs text-blue-300 bg-blue-900/40 px-2 py-0.5 rounded-full animate-pulse">
                      ▶ Playing
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-200">
                    {ai1.score} pts
                  </span>
                  {ai1.red3s.length > 0 && (
                    <span className="ml-2 text-xs text-red-400">
                      🔴 ×{ai1.red3s.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Hand */}
              <Hand
                cards={ai1.hand}
                label="AI Blue's hand"
                disabled
              />

              {/* Melds */}
              <div className="mt-2">
                <MeldSummary melds={ai1.melds} />
              </div>
            </section>

            {/* Centre: pile & stock */}
            <div
              className="bg-slate-800 rounded-xl p-4 flex items-center justify-center gap-8 sm:gap-12"
              aria-label="Discard pile and stock"
            >
              {/* Discard pile */}
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-1">
                  Discard Pile ({gameState.pile.cards.length})
                </p>
                {pileTop ? (
                  <Card card={pileTop} />
                ) : (
                  <div
                    className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-500 text-xs"
                    aria-label="Empty discard pile"
                  >
                    Empty
                  </div>
                )}
                <div className="mt-1 space-y-0.5">
                  {gameState.pile.frozen && (
                    <p className="text-xs text-purple-400">🧊 Frozen</p>
                  )}
                  {gameState.pile.blockedOneTurn && (
                    <p className="text-xs text-orange-400">🚫 Blocked</p>
                  )}
                </div>
              </div>

              {/* Stock */}
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-1">Stock Pile</p>
                <div
                  className="w-14 h-20 sm:w-16 sm:h-24 bg-blue-800 rounded-lg border border-blue-600 flex items-center justify-center"
                  aria-label={`Stock pile: ${gameState.stock.length} cards remaining`}
                >
                  <span className="text-white font-bold text-lg">
                    {gameState.stock.length}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">cards left</p>
              </div>
            </div>

            {/* AI Red player area */}
            <section
              aria-label="AI Red player area"
              className={`bg-slate-800 rounded-xl p-4 border-2 transition-colors ${
                !isRoundEnd && currentPlayerIndex === 1
                  ? 'border-red-500'
                  : 'border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-bold text-sm sm:text-base">
                    🤖 AI Red
                  </span>
                  <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full capitalize">
                    {difficulty2}
                  </span>
                  {!isRoundEnd && currentPlayerIndex === 1 && (
                    <span className="text-xs text-red-300 bg-red-900/40 px-2 py-0.5 rounded-full animate-pulse">
                      ▶ Playing
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-200">
                    {ai2.score} pts
                  </span>
                  {ai2.red3s.length > 0 && (
                    <span className="ml-2 text-xs text-red-400">
                      🔴 ×{ai2.red3s.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Hand */}
              <Hand
                cards={ai2.hand}
                label="AI Red's hand"
                disabled
              />

              {/* Melds */}
              <div className="mt-2">
                <MeldSummary melds={ai2.melds} />
              </div>
            </section>

            {/* Controls */}
            <div
              className="bg-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-center gap-3"
              aria-label="Playback controls"
            >
              {/* Auto-play toggle */}
              <button
                onClick={() => setIsAutoPlay(p => !p)}
                disabled={isOver}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isAutoPlay
                    ? 'bg-orange-600 hover:bg-orange-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
                aria-pressed={isAutoPlay}
                aria-label={isAutoPlay ? 'Pause auto play' : 'Start auto play'}
              >
                {isAutoPlay ? '⏸ Pause' : '▶ Auto Play'}
              </button>

              {/* Manual step (only when paused) */}
              {!isAutoPlay && (
                <button
                  onClick={stepOnce}
                  disabled={isOver || isRoundEnd}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Step to next AI action"
                >
                  ⏭ Next Turn
                </button>
              )}

              {/* Play Again (match over) */}
              {isOver && (
                <button
                  onClick={startNewGame}
                  className="px-4 py-2 bg-green-700 hover:bg-green-600 active:bg-green-800 text-white rounded-lg font-semibold text-sm transition-colors"
                  aria-label="Start a new game"
                >
                  🎮 Play Again
                </button>
              )}
            </div>
          </div>

          {/* ── Commentary panel (1/3 on desktop) ───────────────────────── */}
          <aside
            aria-label="AI commentary"
            className="bg-slate-800 rounded-xl p-4 flex flex-col gap-3 lg:max-h-[calc(100vh-180px)] overflow-hidden"
          >
            <h2 className="font-bold text-slate-200 text-base flex-shrink-0">
              💬 AI Commentary
            </h2>

            {/* Match over banner */}
            {isOver && (
              <div className="flex-shrink-0 p-3 bg-yellow-900/40 border border-yellow-500/50 rounded-xl text-center">
                <p className="text-yellow-400 font-bold text-lg">🏆 Match Over!</p>
                <p className="text-slate-200 mt-1 font-semibold">
                  {ai1.score > ai2.score
                    ? 'AI Blue wins!'
                    : ai1.score < ai2.score
                      ? 'AI Red wins!'
                      : "It's a tie!"}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  {ai1.score} — {ai2.score}
                </p>
              </div>
            )}

            {/* Round-end notice */}
            {isRoundEnd && !isOver && (
              <div className="flex-shrink-0 p-3 bg-slate-700/60 border border-slate-600 rounded-lg">
                <p className="text-slate-300 text-sm font-semibold text-center">
                  ⏳ Round {roundNumber} ending — next round starting shortly…
                </p>
              </div>
            )}

            {/* Latest move highlight */}
            {lastMove && !isRoundEnd && (
              <div className="flex-shrink-0 p-3 bg-blue-900/40 border border-blue-500/40 rounded-xl">
                <p className="text-xs text-blue-400 font-semibold mb-1 uppercase tracking-wide">
                  Latest move
                </p>
                <p className="text-sm text-white leading-relaxed">
                  {lastMove.explanation}
                </p>
              </div>
            )}

            {/* Prompt when no moves yet */}
            {!lastMove && !isOver && (
              <p className="text-slate-400 text-sm italic flex-shrink-0">
                Press <strong className="text-white">Auto Play</strong> or{' '}
                <strong className="text-white">Next Turn</strong> to start watching.
              </p>
            )}

            {/* Move history */}
            {moveHistory.length > 0 && (
              <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide sticky top-0 bg-slate-800 pb-1">
                  Move history
                </p>
                {[...moveHistory]
                  .reverse()
                  .slice(0, 40)
                  .map((move, i) => (
                    <MoveEntry
                      key={moveHistory.length - 1 - i}
                      move={move}
                      isLatest={i === 0 && !isRoundEnd}
                    />
                  ))}
                <div ref={historyEndRef} />
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

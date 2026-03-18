import { useState } from 'react'
import { Hand } from '../Hand'
import { Card } from '../Card'
import { RoundEndModal } from './RoundEndModal'
import { useGameStore } from '../../store/gameStore'
import type { Player } from '../../game/types'

interface Props {
  onExit: () => void
}

interface MeldTarget {
  meldIndex: number
  playerId: string
}

// ─── Meld display strip ───────────────────────────────────────────────────────

function MeldStrip({
  player,
  isCurrentPlayer,
  selectedTarget,
  onMeldClick,
}: {
  player: Player
  isCurrentPlayer: boolean
  selectedTarget: MeldTarget | null
  onMeldClick: (meldIndex: number, playerId: string) => void
}) {
  if (player.melds.length === 0 && player.red3s.length === 0) {
    return (
      <div className="text-xs text-slate-400 italic px-2 py-1">No melds yet</div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2 px-2">
      {/* Red 3s */}
      {player.red3s.map(card => (
        <div key={card.id} className="flex flex-col items-center gap-0.5">
          <span className="text-xs text-red-300 font-semibold">Red 3</span>
          <Card card={card} />
        </div>
      ))}

      {/* Melds */}
      {player.melds.map((meld, meldIdx) => {
        const isTarget =
          selectedTarget?.meldIndex === meldIdx &&
          selectedTarget?.playerId === player.id
        const totalCards = meld.naturals.length + meld.wilds.length
        const isCanasta = totalCards >= 7

        return (
          <button
            key={`${player.id}-meld-${meldIdx}`}
            onClick={() => isCurrentPlayer && onMeldClick(meldIdx, player.id)}
            className={[
              'flex flex-col items-center gap-0.5 rounded-lg p-1 border-2 transition-colors',
              isCurrentPlayer ? 'cursor-pointer hover:bg-green-700/50' : 'cursor-default',
              isTarget ? 'border-yellow-400 bg-yellow-400/20' : 'border-transparent',
              isCanasta ? 'ring-1 ring-amber-400' : '',
            ].join(' ')}
            disabled={!isCurrentPlayer}
            title={isCurrentPlayer ? 'Click to target this meld for "Add to Meld"' : undefined}
            aria-label={`${player.name} ${meld.rank} meld (${totalCards} cards)${isCanasta ? ' — Canasta!' : ''}`}
          >
            <span className="text-xs text-slate-300 font-semibold">
              {meld.rank}
              {isCanasta ? ' 🌟' : ''}
            </span>
            <div className="flex -space-x-3">
              {[...meld.naturals, ...meld.wilds].slice(0, 7).map(card => (
                <div key={card.id} className="hover:z-10">
                  <Card card={card} className="w-10 h-14 sm:w-12 sm:h-16 text-xs" />
                </div>
              ))}
              {totalCards > 7 && (
                <div className="flex items-center justify-center w-10 h-14 sm:w-12 sm:h-16 rounded-lg bg-slate-700 text-white text-xs font-bold">
                  +{totalCards - 7}
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ─── Main GameBoard ───────────────────────────────────────────────────────────

export function GameBoard({ onExit }: Props) {
  const {
    gameState,
    difficulty,
    selectedCardIds,
    hint,
    lastError,
    roundEndData,
    selectCard,
    deselectAll,
    drawFromStock,
    pickUpPile,
    placeMeld,
    addToExistingMeld,
    discardSelected,
    requestHint,
    acknowledgeRoundEnd,
  } = useGameStore()

  const [selectedMeldTarget, setSelectedMeldTarget] = useState<MeldTarget | null>(null)

  if (!gameState) {
    return (
      <div className="flex h-screen items-center justify-center bg-green-900 text-white">
        Loading…
      </div>
    )
  }

  const humanPlayer = gameState.players.find(p => p.id === 'human')!
  const aiPlayers = gameState.players.filter(p => p.type === 'ai')
  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  const isHumanTurn = currentPlayer.id === 'human'
  const phase = gameState.phase
  const topDiscard = gameState.pile.cards[gameState.pile.cards.length - 1] ?? null

  const canDraw = isHumanTurn && phase === 'draw' && gameState.stock.length > 0
  const canPickUp =
    isHumanTurn &&
    phase === 'draw' &&
    gameState.pile.cards.length > 0 &&
    !gameState.pile.blockedOneTurn
  const canMeld = isHumanTurn && phase === 'meld' && selectedCardIds.size >= 2
  const canAddToMeld =
    isHumanTurn &&
    phase === 'meld' &&
    selectedCardIds.size >= 1 &&
    selectedMeldTarget !== null
  const canDiscard = isHumanTurn && phase === 'meld' && selectedCardIds.size === 1

  function handleMeldClick(meldIndex: number, playerId: string) {
    if (selectedMeldTarget?.meldIndex === meldIndex && selectedMeldTarget?.playerId === playerId) {
      setSelectedMeldTarget(null)
    } else {
      setSelectedMeldTarget({ meldIndex, playerId })
    }
  }

  function handleAddToMeld() {
    if (!selectedMeldTarget) return
    addToExistingMeld(selectedMeldTarget.meldIndex, selectedMeldTarget.playerId)
    setSelectedMeldTarget(null)
  }

  const pileLabel = gameState.pile.frozen
    ? '❄️ Frozen'
    : gameState.pile.blockedOneTurn
      ? '🚫 Blocked'
      : `${gameState.pile.cards.length} card${gameState.pile.cards.length !== 1 ? 's' : ''}`

  const roundNum = gameState.roundScores.length + 1

  return (
    <div className="flex flex-col h-screen bg-green-800 text-white overflow-hidden select-none">
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-2 bg-green-900/80 text-sm shrink-0">
        <button
          onClick={onExit}
          className="text-green-300 hover:text-white transition-colors text-xs font-medium"
        >
          ← Exit
        </button>
        <span className="font-semibold text-green-200">
          Round {roundNum} · {difficulty}
        </span>
        <span className="text-xs text-green-400">
          {isHumanTurn ? '🟢 Your turn' : `⏳ ${currentPlayer.name}`}
        </span>
      </div>

      {/* ── AI area ──────────────────────────────────────────────────── */}
      <div className="shrink-0 px-2 pt-2 pb-1 space-y-2 max-h-[40vh] overflow-y-auto">
        {aiPlayers.map(ai => (
          <div key={ai.id} className="bg-green-900/40 rounded-xl p-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-green-300">
                {ai.name}
              </span>
              <span className="text-xs text-slate-400">
                Score: {ai.score} · Hand: {ai.hand.length}
              </span>
              {currentPlayer.id === ai.id && (
                <span className="text-xs bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded-full">
                  Thinking…
                </span>
              )}
            </div>
            {/* AI hand face-down */}
            <Hand cards={ai.hand} faceDown label={`${ai.name} hand`} />
            {/* AI melds */}
            <MeldStrip
              player={ai}
              isCurrentPlayer={false}
              selectedTarget={null}
              onMeldClick={() => {}}
            />
          </div>
        ))}
      </div>

      {/* ── Centre: stock + discard ───────────────────────────────────── */}
      <div className="shrink-0 flex items-start justify-center gap-6 py-3 bg-green-700/30">
        {/* Stock */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-green-300 font-medium">Stock</span>
          <button
            onClick={drawFromStock}
            disabled={!canDraw}
            aria-label={`Draw from stock (${gameState.stock.length} cards)`}
            className={[
              'relative w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28',
              'rounded-lg border-2 transition-all',
              canDraw
                ? 'border-green-400 hover:border-yellow-400 hover:scale-105 cursor-pointer'
                : 'border-slate-600 cursor-not-allowed opacity-50',
              'bg-blue-900 flex items-center justify-center',
            ].join(' ')}
          >
            <div className="absolute inset-1 rounded border border-blue-500 bg-blue-800 opacity-70" />
            <span className="relative z-10 text-white font-bold text-sm">
              {gameState.stock.length}
            </span>
          </button>
          <span className="text-xs text-slate-400">
            {gameState.stock.length} left
          </span>
        </div>

        {/* Discard pile */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-green-300 font-medium">Discard</span>
          <button
            onClick={pickUpPile}
            disabled={!canPickUp}
            aria-label={`Pick up discard pile${topDiscard ? ` (top: ${topDiscard.rank})` : ''}`}
            className={[
              'transition-all',
              canPickUp
                ? 'hover:scale-105 cursor-pointer'
                : 'cursor-not-allowed opacity-80',
            ].join(' ')}
          >
            {topDiscard ? (
              <Card card={topDiscard} />
            ) : (
              <div className="w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28 rounded-lg border-2 border-dashed border-slate-500 flex items-center justify-center text-slate-500 text-xs">
                Empty
              </div>
            )}
          </button>
          <span className="text-xs text-slate-400">{pileLabel}</span>
        </div>
      </div>

      {/* ── Error / Hint ─────────────────────────────────────────────── */}
      {(lastError || hint) && (
        <div className="shrink-0 mx-3 my-1">
          {lastError && (
            <div className="bg-red-900/70 border border-red-700 rounded-lg px-3 py-2 text-xs text-red-200">
              ⚠️ {lastError}
            </div>
          )}
          {hint && !lastError && (
            <div className="bg-blue-900/70 border border-blue-700 rounded-lg px-3 py-2 text-xs text-blue-200">
              💡 {hint}
            </div>
          )}
        </div>
      )}

      {/* ── Human melds ──────────────────────────────────────────────── */}
      <div className="shrink-0 px-2 min-h-[4rem]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-green-300">
            Your melds
          </span>
          <span className="text-xs text-slate-400">Score: {humanPlayer.score}</span>
          {selectedMeldTarget?.playerId === 'human' && (
            <span className="text-xs bg-yellow-400/20 text-yellow-300 px-1.5 py-0.5 rounded-full">
              Meld targeted
            </span>
          )}
        </div>
        <MeldStrip
          player={humanPlayer}
          isCurrentPlayer={isHumanTurn && phase === 'meld'}
          selectedTarget={selectedMeldTarget}
          onMeldClick={handleMeldClick}
        />
      </div>

      {/* ── Human hand ───────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-1">
        <Hand
          cards={humanPlayer.hand}
          selectedIds={selectedCardIds}
          onCardClick={isHumanTurn && phase === 'meld' ? card => selectCard(card.id) : undefined}
          label="Your hand"
          disabled={!isHumanTurn || phase !== 'meld'}
        />
      </div>

      {/* ── Action buttons ────────────────────────────────────────────── */}
      {isHumanTurn && phase !== 'end' && (
        <div className="shrink-0 bg-green-900/80 px-3 py-2 flex flex-wrap gap-2 justify-center">
          {phase === 'draw' && (
            <>
              <ActionButton
                label="Draw 2"
                onClick={drawFromStock}
                disabled={!canDraw}
                colour="blue"
              />
              <ActionButton
                label="Pick Up Pile"
                onClick={pickUpPile}
                disabled={!canPickUp}
                colour="amber"
              />
            </>
          )}

          {phase === 'meld' && (
            <>
              <ActionButton
                label="Meld"
                onClick={placeMeld}
                disabled={!canMeld}
                colour="emerald"
              />
              <ActionButton
                label={selectedMeldTarget ? `Add to ${selectedMeldTarget.playerId === 'human' ? 'Meld' : 'Meld'}` : 'Add to Meld'}
                onClick={handleAddToMeld}
                disabled={!canAddToMeld}
                colour="teal"
              />
              <ActionButton
                label="Discard"
                onClick={discardSelected}
                disabled={!canDiscard}
                colour="rose"
              />
              {selectedCardIds.size > 0 && (
                <ActionButton
                  label="Deselect"
                  onClick={deselectAll}
                  disabled={false}
                  colour="slate"
                />
              )}
            </>
          )}

          <ActionButton
            label="Hint"
            onClick={requestHint}
            disabled={false}
            colour="violet"
          />
        </div>
      )}

      {/* ── Round end modal ───────────────────────────────────────────── */}
      {roundEndData && (
        <RoundEndModal data={roundEndData} onAcknowledge={acknowledgeRoundEnd} />
      )}
    </div>
  )
}

// ─── Small button helper ──────────────────────────────────────────────────────

type ButtonColour = 'blue' | 'amber' | 'emerald' | 'teal' | 'rose' | 'slate' | 'violet'

const COLOUR_MAP: Record<ButtonColour, string> = {
  blue: 'bg-blue-700 hover:bg-blue-600 disabled:bg-blue-900/50',
  amber: 'bg-amber-700 hover:bg-amber-600 disabled:bg-amber-900/50',
  emerald: 'bg-emerald-700 hover:bg-emerald-600 disabled:bg-emerald-900/50',
  teal: 'bg-teal-700 hover:bg-teal-600 disabled:bg-teal-900/50',
  rose: 'bg-rose-700 hover:bg-rose-600 disabled:bg-rose-900/50',
  slate: 'bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700/50',
  violet: 'bg-violet-700 hover:bg-violet-600 disabled:bg-violet-900/50',
}

function ActionButton({
  label,
  onClick,
  disabled,
  colour,
}: {
  label: string
  onClick: () => void
  disabled: boolean
  colour: ButtonColour
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        COLOUR_MAP[colour],
      ].join(' ')}
    >
      {label}
    </button>
  )
}

import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageLayout } from '../components/PageLayout'
import { getReplay } from '../replay/replayService'
import { setReplayVisibility } from '../replay/replayService'
import type { GameReplay, ReplayAction } from '../replay/types'
import { useAuth } from '../auth/AuthContext'

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString()
}

function PlayerHand({ action }: { action: ReplayAction }) {
  const state = action.stateBefore
  return (
    <div className="space-y-3">
      {state.players.map((player) => (
        <div key={player.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
          <div className="font-semibold text-sm mb-1">
            {player.name}
            {player.id === action.playerId && (
              <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-normal">(active)</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Hand: {player.hand.length} cards
            </span>
            {player.melds.length > 0 && (
              <span className="text-green-600 dark:text-green-400 ml-2">
                Melds: {player.melds.length}
              </span>
            )}
            {player.red3s.length > 0 && (
              <span className="text-red-500 ml-2">
                Red 3s: {player.red3s.length}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export function Replay() {
  const { gameId } = useParams<{ gameId: string }>()
  const { currentUser } = useAuth()
  const [replay, setReplay] = useState<GameReplay | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPublic, setIsPublic] = useState(false)
  const [sharingBusy, setSharingBusy] = useState(false)

  useEffect(() => {
    if (!gameId) return
    setLoading(true)
    getReplay(gameId)
      .then((r) => {
        if (!r) {
          setError('Replay not found.')
        } else {
          setReplay(r)
          setIsPublic(r.isPublic)
        }
      })
      .catch(() => setError('Failed to load replay.'))
      .finally(() => setLoading(false))
  }, [gameId])

  const goTo = useCallback(
    (step: number) => {
      if (!replay) return
      const max = replay.actions.length - 1
      setCurrentStep(Math.max(0, Math.min(step, max)))
    },
    [replay],
  )

  async function handleToggleVisibility() {
    if (!replay || !gameId) return
    setSharingBusy(true)
    const next = !isPublic
    try {
      await setReplayVisibility(gameId, next)
      setIsPublic(next)
    } catch {
      // ignore
    } finally {
      setSharingBusy(false)
    }
  }

  if (loading) {
    return (
      <PageLayout title="Replay">
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>
      </PageLayout>
    )
  }

  if (error || !replay) {
    return (
      <PageLayout title="Replay">
        <div className="text-center py-16 space-y-4">
          <div className="text-4xl" aria-hidden="true">🎬</div>
          <p className="text-slate-500 dark:text-slate-400">{error ?? 'Replay not found.'}</p>
          <Link to="/" className="inline-block text-blue-600 dark:text-blue-400 hover:underline">
            Back to Home
          </Link>
        </div>
      </PageLayout>
    )
  }

  const action: ReplayAction | null = replay.actions[currentStep] ?? null
  const totalSteps = replay.actions.length

  return (
    <PageLayout title="Replay">
      <div className="space-y-6">
        {/* Header info */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">
                {replay.playerNames.join(' vs ')}
              </h2>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Variant: <span className="font-medium">{replay.variant}</span>
                &nbsp;·&nbsp;
                Played: <span className="font-medium">{formatTimestamp(replay.playedAt)}</span>
              </div>
            </div>
            {currentUser?.uid === replay.ownerUid && (
              <button
                onClick={handleToggleVisibility}
                disabled={sharingBusy}
                className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {isPublic ? '🔓 Public' : '🔒 Private'}
              </button>
            )}
          </div>
          {isPublic && (
            <div className="text-xs text-green-600 dark:text-green-400">
              Share link: {window.location.href}
            </div>
          )}
        </section>

        {totalSteps === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">
            No recorded actions in this replay.
          </p>
        ) : (
          <>
            {/* Step controls */}
            <section aria-label="Replay controls" className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => goTo(0)}
                  disabled={currentStep === 0}
                  aria-label="Jump to first action"
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
                >
                  ⏮
                </button>
                <button
                  onClick={() => goTo(currentStep - 1)}
                  disabled={currentStep === 0}
                  aria-label="Previous action"
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
                >
                  ◀
                </button>
                <span className="flex-1 text-center text-sm font-medium text-slate-600 dark:text-slate-300">
                  Step {currentStep + 1} / {totalSteps}
                </span>
                <button
                  onClick={() => goTo(currentStep + 1)}
                  disabled={currentStep >= totalSteps - 1}
                  aria-label="Next action"
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
                >
                  ▶
                </button>
                <button
                  onClick={() => goTo(totalSteps - 1)}
                  disabled={currentStep >= totalSteps - 1}
                  aria-label="Jump to last action"
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
                >
                  ⏭
                </button>
              </div>

              {/* Scrubber */}
              <input
                type="range"
                min={0}
                max={totalSteps - 1}
                value={currentStep}
                onChange={(e) => goTo(Number(e.target.value))}
                className="w-full accent-blue-600"
                aria-label="Replay scrubber"
              />
            </section>

            {/* Action description */}
            {action && (
              <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="text-xs text-blue-500 dark:text-blue-400 mb-1 font-medium">
                  Turn {action.turnNumber}
                </div>
                <div className="font-semibold text-blue-900 dark:text-blue-100">
                  {action.description}
                </div>
              </section>
            )}

            {/* Board state */}
            {action && (
              <section className="space-y-2">
                <h3 className="font-semibold text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Board State
                </h3>
                <div className="flex gap-4 text-sm">
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 flex-1 text-center">
                    <div className="text-2xl" aria-hidden="true">🃏</div>
                    <div className="font-semibold">{action.stateBefore.stock.length}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Stock</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 flex-1 text-center">
                    <div className="text-2xl" aria-hidden="true">📤</div>
                    <div className="font-semibold">{action.stateBefore.pile.cards.length}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Discard Pile</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 flex-1 text-center">
                    <div className="text-2xl" aria-hidden="true">🔄</div>
                    <div className="font-semibold">{action.stateBefore.phase}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Phase</div>
                  </div>
                </div>
                <PlayerHand action={action} />
              </section>
            )}
          </>
        )}
      </div>
    </PageLayout>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../components/PageLayout'
import { useAuth } from '../auth/AuthContext'
import { getFirebaseDb } from '../auth/firebase'
import {
  createTournament,
  joinTournament,
  listOpenTournaments,
} from '../tournament/tournamentService'
import { getOrCreateEntry } from '../leaderboard/eloService'
import type { Tournament, TournamentFormat } from '../tournament/types'
import type { Variant } from '../game/types'

const VARIANT_LABELS: Record<Variant, string> = {
  '2p': '2-Player',
  '3p': '3-Player',
  '4p-partnership': '4-Player Partnership',
}

const FORMAT_LABELS: Record<TournamentFormat, string> = {
  'round-robin': 'Round Robin',
  'single-elimination': 'Single Elimination',
}

// ─── No Firebase notice ───────────────────────────────────────────────────────

function NoFirebase() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center p-6">
      <div className="bg-white/10 rounded-2xl p-8 max-w-sm text-center space-y-4">
        <div className="text-5xl">🔌</div>
        <h2 className="text-2xl font-bold">Tournaments Unavailable</h2>
        <p className="text-slate-300">
          Tournaments require Firebase configuration. Please set up your Firebase environment variables.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-2 px-6 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors font-medium"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Tournaments() {
  const { currentUser, loading } = useAuth()
  const navigate = useNavigate()

  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [fetching, setFetching] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Create form state
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createVariant, setCreateVariant] = useState<Variant>('2p')
  const [createFormat, setCreateFormat] = useState<TournamentFormat>('round-robin')
  const [createMax, setCreateMax] = useState(4)

  useEffect(() => {
    if (!getFirebaseDb()) return
    setFetching(true)
    listOpenTournaments()
      .then(setTournaments)
      .catch(() => setError('Failed to load tournaments'))
      .finally(() => setFetching(false))
  }, [])

  if (!getFirebaseDb()) return <NoFirebase />

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-canasta-gold border-t-transparent animate-spin" />
      </div>
    )
  }

  async function handleCreate() {
    if (!currentUser) { setError('You must be signed in to create a tournament'); return }
    if (!createName.trim()) { setError('Please enter a tournament name'); return }
    setError('')
    setBusy(true)
    try {
      const entry = await getOrCreateEntry(currentUser.uid, currentUser.displayName ?? currentUser.email ?? 'Player')
      const creator = {
        uid: currentUser.uid,
        displayName: currentUser.displayName ?? currentUser.email ?? 'Player',
        elo: entry.elo,
        points: 0,
        wins: 0,
        losses: 0,
        seed: 1,
      }
      const id = await createTournament(createName, createVariant, createFormat, createMax, creator)
      navigate(`/tournaments/${id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create tournament')
    } finally {
      setBusy(false)
    }
  }

  async function handleJoin(tournamentId: string) {
    if (!currentUser) { setError('You must be signed in to join a tournament'); return }
    setError('')
    setBusy(true)
    try {
      const entry = await getOrCreateEntry(currentUser.uid, currentUser.displayName ?? currentUser.email ?? 'Player')
      const player = {
        uid: currentUser.uid,
        displayName: currentUser.displayName ?? currentUser.email ?? 'Player',
        elo: entry.elo,
        points: 0,
        wins: 0,
        losses: 0,
        seed: 0,
      }
      await joinTournament(tournamentId, player)
      navigate(`/tournaments/${tournamentId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join tournament')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageLayout title="Tournaments 🏆">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Create button */}
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            + Create Tournament
          </button>
        )}

        {/* Create form */}
        {showCreate && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
            <h2 className="font-bold text-lg">New Tournament</h2>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="t-name">Name</label>
              <input
                id="t-name"
                type="text"
                value={createName}
                onChange={e => setCreateName(e.target.value)}
                placeholder="e.g. Friday Night Canasta"
                maxLength={60}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Variant</p>
              <div className="grid grid-cols-3 gap-2">
                {(['2p', '3p', '4p-partnership'] as Variant[]).map(v => (
                  <button
                    key={v}
                    onClick={() => setCreateVariant(v)}
                    className={`py-2 px-2 rounded-lg text-xs font-medium border-2 transition-colors ${createVariant === v ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-200 dark:border-slate-600'}`}
                    aria-pressed={createVariant === v}
                  >
                    {VARIANT_LABELS[v]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Format</p>
              <div className="grid grid-cols-2 gap-2">
                {(['round-robin', 'single-elimination'] as TournamentFormat[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setCreateFormat(f)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border-2 transition-colors ${createFormat === f ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-200 dark:border-slate-600'}`}
                    aria-pressed={createFormat === f}
                  >
                    {FORMAT_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="t-max">Max Players</label>
              <select
                id="t-max"
                value={createMax}
                onChange={e => setCreateMax(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
              >
                {[2, 3, 4, 6, 8].map(n => (
                  <option key={n} value={n}>{n} players</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowCreate(false); setError('') }}
                className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={busy}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {busy ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        )}

        {/* Tournament list */}
        <section>
          <h2 className="text-lg font-bold mb-3">Open Tournaments</h2>
          {fetching && (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            </div>
          )}
          {!fetching && tournaments.length === 0 && (
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">
              No open tournaments right now. Create one!
            </p>
          )}
          {!fetching && tournaments.length > 0 && (
            <ul className="space-y-3">
              {tournaments.map(t => {
                const isFull = t.players.length >= t.maxPlayers
                const isMine = currentUser && t.players.some(p => p.uid === currentUser.uid)
                return (
                  <li key={t.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div className="font-semibold">{t.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 space-x-2">
                          <span>{VARIANT_LABELS[t.variant]}</span>
                          <span>·</span>
                          <span>{FORMAT_LABELS[t.format]}</span>
                          <span>·</span>
                          <span>{t.players.length}/{t.maxPlayers} players</span>
                          <span>·</span>
                          <span className={t.status === 'in-progress' ? 'text-green-600 dark:text-green-400' : ''}>
                            {t.status === 'registering' ? 'Registering' : 'In Progress'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/tournaments/${t.id}`)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          View
                        </button>
                        {!isMine && t.status === 'registering' && (
                          <button
                            onClick={() => handleJoin(t.id)}
                            disabled={busy || isFull}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                          >
                            {isFull ? 'Full' : 'Join'}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </PageLayout>
  )
}

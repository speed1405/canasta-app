import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageLayout } from '../components/PageLayout'
import { useAuth } from '../auth/AuthContext'
import {
  subscribeToTournament,
  startTournament,
  reportMatchResult,
} from '../tournament/tournamentService'
import type { Tournament, TournamentMatch, TournamentPlayer } from '../tournament/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function playerName(players: TournamentPlayer[], uid: string): string {
  return players.find(p => p.uid === uid)?.displayName ?? uid
}

// ─── Round-Robin standings table ──────────────────────────────────────────────

function RoundRobinStandings({ t }: { t: Tournament }) {
  const sorted = [...t.players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    return b.wins - a.wins
  })

  return (
    <section>
      <h2 className="text-lg font-bold mb-3">Standings</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-700">
              <th className="text-left px-3 py-2 rounded-tl-lg">#</th>
              <th className="text-left px-3 py-2">Player</th>
              <th className="text-center px-3 py-2">W</th>
              <th className="text-center px-3 py-2">L</th>
              <th className="text-center px-3 py-2 rounded-tr-lg">Pts</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => (
              <tr
                key={p.uid}
                className={`border-t border-slate-200 dark:border-slate-700 ${i === 0 && t.status === 'finished' ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
              >
                <td className="px-3 py-2 text-slate-500">
                  {i === 0 && t.status === 'finished' ? '🏆' : i + 1}
                </td>
                <td className="px-3 py-2 font-medium">{p.displayName}</td>
                <td className="px-3 py-2 text-center">{p.wins}</td>
                <td className="px-3 py-2 text-center">{p.losses}</td>
                <td className="px-3 py-2 text-center font-bold">{p.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ─── Single-elimination bracket ───────────────────────────────────────────────

function EliminationBracket({ t }: { t: Tournament }) {
  const rounds = Array.from(new Set(t.matches.map(m => m.round))).sort((a, b) => a - b)

  return (
    <section>
      <h2 className="text-lg font-bold mb-3">Bracket</h2>
      <div className="space-y-6">
        {rounds.map(round => (
          <div key={round}>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Round {round}
            </h3>
            <div className="space-y-2">
              {t.matches
                .filter(m => m.round === round)
                .map(m => (
                  <MatchCard key={m.id} match={m} players={t.players} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Match card ───────────────────────────────────────────────────────────────

function MatchCard({ match, players }: { match: TournamentMatch; players: TournamentPlayer[] }) {
  const p1Name = playerName(players, match.player1Uid)
  const p2Name = playerName(players, match.player2Uid)
  const isFinished = match.status === 'finished'

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex items-center gap-3">
      <div className={`flex-1 text-sm font-medium ${isFinished && match.winnerUid === match.player1Uid ? 'text-green-600 dark:text-green-400' : ''}`}>
        {p1Name}
        {isFinished && <span className="ml-1 text-xs text-slate-400">({match.player1Score})</span>}
      </div>
      <div className="text-xs text-slate-400 font-bold">vs</div>
      <div className={`flex-1 text-sm font-medium text-right ${isFinished && match.winnerUid === match.player2Uid ? 'text-green-600 dark:text-green-400' : ''}`}>
        {p2Name}
        {isFinished && <span className="ml-1 text-xs text-slate-400">({match.player2Score})</span>}
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        isFinished ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
        match.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
        'bg-slate-100 text-slate-500 dark:bg-slate-700'
      }`}>
        {isFinished ? 'Done' : match.status === 'in-progress' ? 'Live' : 'Pending'}
      </span>
    </div>
  )
}

// ─── Report result form ───────────────────────────────────────────────────────

function ReportResultForm({
  tournament,
  onDone,
}: {
  tournament: Tournament
  onDone: () => void
}) {
  const [matchId, setMatchId] = useState('')
  const [winnerUid, setWinnerUid] = useState('')
  const [p1Score, setP1Score] = useState(0)
  const [p2Score, setP2Score] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const pendingMatches = tournament.matches.filter(m => m.status !== 'finished')
  const selected = pendingMatches.find(m => m.id === matchId)

  async function handleSubmit() {
    if (!matchId || !winnerUid) { setError('Select a match and winner'); return }
    setError('')
    setBusy(true)
    try {
      await reportMatchResult(tournament.id, matchId, winnerUid, p1Score, p2Score)
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to report result')
    } finally {
      setBusy(false)
    }
  }

  if (pendingMatches.length === 0) return null

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
      <h3 className="font-bold text-base">Report Match Result</h3>

      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="report-match">Match</label>
        <select
          id="report-match"
          value={matchId}
          onChange={e => { setMatchId(e.target.value); setWinnerUid('') }}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
        >
          <option value="">Select a match…</option>
          {pendingMatches.map(m => (
            <option key={m.id} value={m.id}>
              {playerName(tournament.players, m.player1Uid)} vs {playerName(tournament.players, m.player2Uid)} (Rd {m.round})
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="report-winner">Winner</label>
            <select
              id="report-winner"
              value={winnerUid}
              onChange={e => setWinnerUid(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
            >
              <option value="">Select winner…</option>
              <option value={selected.player1Uid}>{playerName(tournament.players, selected.player1Uid)}</option>
              <option value={selected.player2Uid}>{playerName(tournament.players, selected.player2Uid)}</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="p1-score">
                {playerName(tournament.players, selected.player1Uid)} score
              </label>
              <input
                id="p1-score"
                type="number"
                value={p1Score}
                onChange={e => setP1Score(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="p2-score">
                {playerName(tournament.players, selected.player2Uid)} score
              </label>
              <input
                id="p2-score"
                type="number"
                value={p2Score}
                onChange={e => setP2Score(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
              />
            </div>
          </div>
        </>
      )}

      <button
        onClick={handleSubmit}
        disabled={busy || !matchId || !winnerUid}
        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
      >
        {busy ? 'Saving…' : 'Submit Result'}
      </button>
    </div>
  )
}

// ─── TournamentView ───────────────────────────────────────────────────────────

export function TournamentView() {
  const { tournamentId } = useParams<{ tournamentId: string }>()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [showReportForm, setShowReportForm] = useState(false)
  const [startBusy, setStartBusy] = useState(false)
  const [startError, setStartError] = useState('')

  useEffect(() => {
    if (!tournamentId) return
    const unsub = subscribeToTournament(tournamentId, setTournament)
    return unsub
  }, [tournamentId])

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  const isHost = currentUser?.uid === tournament.createdBy
  const isParticipant = currentUser && tournament.players.some(p => p.uid === currentUser.uid)

  async function handleStart() {
    if (!tournamentId) return
    setStartError('')
    setStartBusy(true)
    try {
      await startTournament(tournamentId)
    } catch (e) {
      setStartError(e instanceof Error ? e.message : 'Failed to start tournament')
    } finally {
      setStartBusy(false)
    }
  }

  const statusLabel = {
    registering: '🟡 Registering',
    'in-progress': '🟢 In Progress',
    finished: '✅ Finished',
  }[tournament.status]

  return (
    <PageLayout title={tournament.name} backTo="/tournaments" backLabel="← Tournaments">
      <div className="space-y-6">
        {/* Tournament info header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm text-slate-500 dark:text-slate-400 space-x-2">
                <span>{tournament.format === 'round-robin' ? 'Round Robin' : 'Single Elimination'}</span>
                <span>·</span>
                <span>
                  {tournament.variant === '2p' ? '2-Player' :
                   tournament.variant === '3p' ? '3-Player' : '4-Player Partnership'}
                </span>
                <span>·</span>
                <span>{tournament.players.length}/{tournament.maxPlayers} players</span>
              </div>
              <div className="mt-1 text-sm font-medium">{statusLabel}</div>
            </div>
            {isHost && tournament.status === 'registering' && (
              <button
                onClick={handleStart}
                disabled={startBusy || tournament.players.length < 2}
                className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {startBusy ? 'Starting…' : 'Start Tournament'}
              </button>
            )}
          </div>
          {startError && <p className="mt-2 text-red-600 dark:text-red-400 text-sm">{startError}</p>}
        </div>

        {/* Players list (during registration) */}
        {tournament.status === 'registering' && (
          <section>
            <h2 className="text-lg font-bold mb-3">
              Players ({tournament.players.length}/{tournament.maxPlayers})
            </h2>
            <ul className="space-y-2">
              {tournament.players.map(p => (
                <li key={p.uid} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
                  <span className="font-medium">{p.displayName}</span>
                  <span className="text-xs text-slate-500">Elo {p.elo}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Matches / standings (once started) */}
        {tournament.status !== 'registering' && tournament.format === 'round-robin' && (
          <RoundRobinStandings t={tournament} />
        )}
        {tournament.status !== 'registering' && tournament.format === 'single-elimination' && (
          <EliminationBracket t={tournament} />
        )}

        {/* All matches list */}
        {tournament.status !== 'registering' && tournament.matches.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-3">Matches</h2>
            <div className="space-y-2">
              {tournament.matches.map(m => (
                <MatchCard key={m.id} match={m} players={tournament.players} />
              ))}
            </div>
          </section>
        )}

        {/* Report result (host or participant, when in-progress) */}
        {tournament.status === 'in-progress' && (isHost || isParticipant) && (
          <div>
            <button
              onClick={() => setShowReportForm(v => !v)}
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
            >
              {showReportForm ? '▲ Hide report form' : '▼ Report match result'}
            </button>
            {showReportForm && (
              <div className="mt-4">
                <ReportResultForm
                  tournament={tournament}
                  onDone={() => setShowReportForm(false)}
                />
              </div>
            )}
          </div>
        )}

        {/* Winner announcement */}
        {tournament.status === 'finished' && (() => {
          const winner = [...tournament.players].sort((a, b) => b.points - a.points)[0]
          return winner ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-5 text-center">
              <div className="text-4xl mb-2">🏆</div>
              <div className="font-bold text-lg">Tournament Winner</div>
              <div className="text-yellow-700 dark:text-yellow-400 font-semibold mt-1">
                {winner.displayName}
              </div>
              <div className="text-sm text-slate-500 mt-1">{winner.points} points · {winner.wins} wins</div>
            </div>
          ) : null
        })()}

        <button
          onClick={() => navigate('/tournaments')}
          className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          ← Back to Tournaments
        </button>
      </div>
    </PageLayout>
  )
}

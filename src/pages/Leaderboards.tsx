import { useState, useEffect } from 'react'
import { PageLayout } from '../components/PageLayout'
import { useAuth } from '../auth/AuthContext'
import { getFirebaseDb } from '../auth/firebase'
import {
  getTopEntries,
  getVariantLeaderboard,
  getUserEntry,
  DEFAULT_ELO,
} from '../leaderboard/eloService'
import type { LeaderboardEntry } from '../leaderboard/eloService'
import type { Variant } from '../game/types'

type Tab = 'overall' | '2p' | '3p' | '4p-partnership'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overall', label: 'Overall' },
  { id: '2p', label: '2-Player' },
  { id: '3p', label: '3-Player' },
  { id: '4p-partnership', label: 'Partnership' },
]

function EloBar({ elo }: { elo: number }) {
  // Visual bar: 800 = 0%, 2000 = 100%
  const pct = Math.min(100, Math.max(0, ((elo - 800) / 1200) * 100))
  return (
    <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 rounded-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>
  if (rank === 2) return <span className="text-xl">🥈</span>
  if (rank === 3) return <span className="text-xl">🥉</span>
  return <span className="text-sm text-slate-500 w-6 text-center">{rank}</span>
}

function LeaderboardTable({
  entries,
  myUid,
  loading,
}: {
  entries: LeaderboardEntry[]
  myUid: string | null
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-10">
        No rankings yet. Play some games to appear here!
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-700">
            <th className="text-left px-3 py-2 rounded-tl-lg">#</th>
            <th className="text-left px-3 py-2">Player</th>
            <th className="text-center px-3 py-2">Elo</th>
            <th className="text-center px-3 py-2">W</th>
            <th className="text-center px-3 py-2 rounded-tr-lg">L</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const isMe = entry.uid === myUid
            return (
              <tr
                key={entry.uid}
                className={`border-t border-slate-200 dark:border-slate-700 ${isMe ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              >
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center w-6">
                    <RankBadge rank={i + 1} />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className={`font-medium ${isMe ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                    {entry.displayName}
                    {isMe && <span className="ml-1 text-xs opacity-60">(you)</span>}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="font-bold">{entry.elo}</span>
                    <EloBar elo={entry.elo} />
                  </div>
                </td>
                <td className="px-3 py-2 text-center">{entry.wins}</td>
                <td className="px-3 py-2 text-center">{entry.losses}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Leaderboards() {
  const { currentUser } = useAuth()
  const [tab, setTab] = useState<Tab>('overall')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [myEntry, setMyEntry] = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(!getFirebaseDb() ? false : true)

  const noFirebase = !getFirebaseDb()

  useEffect(() => {
    if (noFirebase) return
    let cancelled = false
    const fetcher =
      tab === 'overall'
        ? getTopEntries(50)
        : getVariantLeaderboard(tab as Variant, 50)
    fetcher
      .then(data => { if (!cancelled) setEntries(data) })
      .catch(() => { if (!cancelled) setEntries([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true; setLoading(true) }
  }, [tab, noFirebase])

  useEffect(() => {
    if (!currentUser || noFirebase) return
    getUserEntry(currentUser.uid).then(setMyEntry).catch(() => {})
  }, [currentUser, noFirebase])

  const myRank =
    myEntry && entries.length > 0
      ? entries.findIndex(e => e.uid === myEntry.uid) + 1
      : null

  return (
    <PageLayout title="Leaderboards 🏅">
      <div className="space-y-6">
        {noFirebase && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            ⚠️ Leaderboards require Firebase configuration. Rankings will appear here once Firebase is set up.
          </div>
        )}

        {/* My rank card */}
        {currentUser && myEntry && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Your Rating</div>
                <div className="text-3xl font-bold mt-0.5">{myEntry.elo}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {myEntry.wins}W · {myEntry.losses}L
                  {myRank && myRank > 0 ? ` · Rank #${myRank}` : ''}
                </div>
              </div>
              <div className="text-5xl opacity-20">🎯</div>
            </div>
          </div>
        )}

        {!currentUser && !noFirebase && (
          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
            Sign in to see your ranking and have your wins tracked.
          </div>
        )}

        {/* How Elo works */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
          <h2 className="font-semibold text-sm mb-2">How ratings work</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Ratings use the <strong>Elo system</strong> (starting at {DEFAULT_ELO}). Beating a
            higher-rated opponent earns more points; losing to a lower-rated opponent costs
            more. Ratings update after every multiplayer or tournament match.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t.id
                  ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Leaderboard table */}
        <LeaderboardTable entries={entries} myUid={currentUser?.uid ?? null} loading={loading} />
      </div>
    </PageLayout>
  )
}

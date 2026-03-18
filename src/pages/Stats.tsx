import { useState } from 'react'
import { PageLayout } from '../components/PageLayout'
import {
  loadStats,
  clearStats,
  exportStats,
  winRate,
  averageScore,
  longestWinStreak,
  recentGames,
  winRateByDifficulty,
} from '../game/stats'
import type { AIDifficulty } from '../game/types'

const DIFFICULTIES: AIDifficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert']

export function Stats() {
  const [stats, setStats] = useState(() => loadStats())
  const [showConfirm, setShowConfirm] = useState(false)

  function handleClear() {
    clearStats()
    setStats(loadStats())
    setShowConfirm(false)
  }

  function handleDownload() {
    const json = exportStats(stats)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'canasta-stats.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const recent = recentGames(stats, 20)

  return (
    <PageLayout title="Statistics">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Games played', value: stats.gamesPlayed },
          { label: 'Wins', value: stats.wins },
          { label: 'Win rate', value: `${Math.round(winRate(stats) * 100)}%` },
          { label: 'Best score', value: stats.bestScore.toLocaleString() },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center"
          >
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* More stats */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(averageScore(stats)).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average score</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-center">
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {longestWinStreak(stats)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Longest win streak</div>
        </div>
      </div>

      {/* Win rate by difficulty */}
      <section className="mb-8" aria-labelledby="wr-by-diff">
        <h2 id="wr-by-diff" className="text-lg font-bold mb-3">Win rate by difficulty</h2>
        <ul className="space-y-2">
          {DIFFICULTIES.map((d) => {
            const rate = Math.round(winRateByDifficulty(stats, d) * 100)
            return (
              <li key={d} className="flex items-center gap-3">
                <span className="w-20 text-sm capitalize">{d}</span>
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${rate}%` }}
                    role="progressbar"
                    aria-valuenow={rate}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${d} win rate ${rate}%`}
                  />
                </div>
                <span className="w-10 text-right text-sm font-mono">{rate}%</span>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Recent games */}
      <section className="mb-8" aria-labelledby="recent">
        <h2 id="recent" className="text-lg font-bold mb-3">Recent games (last 20)</h2>
        {recent.length === 0 ? (
          <p className="text-slate-500 text-sm">No games played yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700">
                  <th className="text-left p-2 border border-slate-200 dark:border-slate-600">Date</th>
                  <th className="text-left p-2 border border-slate-200 dark:border-slate-600">Variant</th>
                  <th className="text-left p-2 border border-slate-200 dark:border-slate-600">Difficulty</th>
                  <th className="text-right p-2 border border-slate-200 dark:border-slate-600">Your score</th>
                  <th className="text-center p-2 border border-slate-200 dark:border-slate-600">Result</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((g) => (
                  <tr key={g.id} className="even:bg-slate-50 dark:even:bg-slate-800">
                    <td className="p-2 border border-slate-200 dark:border-slate-600 whitespace-nowrap">
                      {new Date(g.date).toLocaleDateString()}
                    </td>
                    <td className="p-2 border border-slate-200 dark:border-slate-600 uppercase text-xs">{g.variant}</td>
                    <td className="p-2 border border-slate-200 dark:border-slate-600 capitalize">{g.difficulty}</td>
                    <td className="p-2 border border-slate-200 dark:border-slate-600 text-right font-mono">
                      {(g.scores['human'] ?? 0).toLocaleString()}
                    </td>
                    <td className="p-2 border border-slate-200 dark:border-slate-600 text-center">
                      {g.winner === 'human' ? (
                        <span className="text-green-600 font-semibold">Win</span>
                      ) : (
                        <span className="text-red-500 font-semibold">Loss</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold transition-colors"
        >
          ⬇ Download stats
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="flex-1 py-3 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold transition-colors"
        >
          🗑 Clear history
        </button>
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h2 id="confirm-title" className="text-lg font-bold mb-2">Clear all history?</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              This will permanently delete all your game history and statistics. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}

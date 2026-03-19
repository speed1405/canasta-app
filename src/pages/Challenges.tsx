import { useState, useEffect } from 'react'
import { PageLayout } from '../components/PageLayout'
import { getDailyChallenge, getWeeklyChallenge, getChallengeLeaderboard } from '../challenges/challengeService'
import type { Challenge, ChallengeLeaderboard } from '../challenges/types'

function LeaderboardTable({ leaderboard }: { leaderboard: ChallengeLeaderboard }) {
  if (leaderboard.entries.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 italic">
        No entries yet — be the first!
      </p>
    )
  }
  return (
    <ol className="space-y-1">
      {leaderboard.entries.slice(0, 10).map((entry, i) => (
        <li
          key={entry.uid}
          className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg px-4 py-2 border border-slate-200 dark:border-slate-700 text-sm"
        >
          <div className="flex items-center gap-3">
            <span className="w-5 text-center font-bold text-slate-500 dark:text-slate-400">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
            </span>
            <span className="font-medium">{entry.displayName}</span>
          </div>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {entry.score.toLocaleString()}
          </span>
        </li>
      ))}
    </ol>
  )
}

function ChallengeCard({
  challenge,
  leaderboard,
  loadingLb,
}: {
  challenge: Challenge
  leaderboard: ChallengeLeaderboard | null
  loadingLb: boolean
}) {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            {challenge.type === 'daily' ? '📅 Daily Challenge' : '🗓️ Weekly Challenge'}
          </div>
          <h2 className="text-lg font-bold">{challenge.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {challenge.description}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">Seed</div>
          <div className="font-mono text-xs text-slate-600 dark:text-slate-300 mt-0.5 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
            {challenge.seed}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
          Leaderboard
        </h3>
        {loadingLb ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <LeaderboardTable leaderboard={leaderboard ?? { challengeId: challenge.id, entries: [] }} />
        )}
      </div>
    </section>
  )
}

export function Challenges() {
  const daily = getDailyChallenge()
  const weekly = getWeeklyChallenge()

  const [dailyLb, setDailyLb] = useState<ChallengeLeaderboard | null>(null)
  const [weeklyLb, setWeeklyLb] = useState<ChallengeLeaderboard | null>(null)
  const [loadingLbs, setLoadingLbs] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingLbs(true)
    Promise.all([
      getChallengeLeaderboard(daily.id),
      getChallengeLeaderboard(weekly.id),
    ])
      .then(([d, w]) => {
        setDailyLb(d)
        setWeeklyLb(w)
      })
      .catch(() => {
        setDailyLb({ challengeId: daily.id, entries: [] })
        setWeeklyLb({ challengeId: weekly.id, entries: [] })
      })
      .finally(() => setLoadingLbs(false))
  }, [daily.id, weekly.id])

  return (
    <PageLayout title="Challenges">
      <div className="space-y-8">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Every player receives the same hand each day and each week. Play a game, note your score,
          and see how you rank against the community!
        </p>

        <ChallengeCard challenge={daily} leaderboard={dailyLb} loadingLb={loadingLbs} />
        <ChallengeCard challenge={weekly} leaderboard={weeklyLb} loadingLb={loadingLbs} />
      </div>
    </PageLayout>
  )
}

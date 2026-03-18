import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageLayout } from '../components/PageLayout'
import { SCENARIOS } from '../game/scenarios'
import { getScenarioResults } from '../game/practiceProgress'

export function PracticeList() {
  const [results] = useState(() => getScenarioResults())

  const passedCount = SCENARIOS.filter((s) => results[s.id]?.passed).length
  const progressPct = Math.round((passedCount / SCENARIOS.length) * 100)

  return (
    <PageLayout title="Practice">
      <p className="text-slate-500 dark:text-slate-400 mb-4">
        Work through scenario drills to sharpen your Canasta skills.
      </p>

      {/* Overall progress bar */}
      <div className="mb-6" aria-label="Overall progress">
        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-1">
          <span>{passedCount} of {SCENARIOS.length} drills passed</span>
          <span>{progressPct}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      <ul className="space-y-3">
        {SCENARIOS.map((scen, i) => {
          const result = results[scen.id]
          const passed = result?.passed ?? false
          const attempted = result !== undefined

          return (
            <li key={scen.id}>
              <Link
                to={`/practice/${scen.id}`}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors group ${
                  passed
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 hover:border-green-400'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-500'
                }`}
              >
                {/* Number / status badge */}
                {passed ? (
                  <span
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white font-bold text-sm shrink-0"
                    aria-label="Passed"
                  >
                    ✓
                  </span>
                ) : attempted ? (
                  <span
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 font-bold text-sm shrink-0"
                    aria-label="Attempted"
                  >
                    ✗
                  </span>
                ) : (
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-bold text-sm shrink-0">
                    {i + 1}
                  </span>
                )}

                <div className="flex-1 min-w-0">
                  <div
                    className={`font-semibold transition-colors ${
                      passed
                        ? 'text-green-700 dark:text-green-400'
                        : 'group-hover:text-green-600 dark:group-hover:text-green-400'
                    }`}
                  >
                    {scen.title}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {scen.description}
                    {result && (
                      <span className="ml-2 text-slate-400 dark:text-slate-500">
                        · {result.attempts} attempt{result.attempts !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-slate-400 text-lg" aria-hidden="true">›</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </PageLayout>
  )
}

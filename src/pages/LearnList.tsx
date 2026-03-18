import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageLayout } from '../components/PageLayout'
import { LESSONS } from '../game/lessons'
import { getCompletedLessons } from '../game/learnProgress'

export function LearnList() {
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  useEffect(() => {
    setCompleted(getCompletedLessons())
  }, [])

  const completedCount = LESSONS.filter((l) => completed.has(l.id)).length
  const progressPct = Math.round((completedCount / LESSONS.length) * 100)

  return (
    <PageLayout title="Learn">
      <p className="text-slate-500 dark:text-slate-400 mb-4">
        Work through the lessons to master every Canasta rule.
      </p>

      {/* Overall progress bar */}
      <div className="mb-6" aria-label="Overall progress">
        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-1">
          <span>{completedCount} of {LESSONS.length} lessons completed</span>
          <span>{progressPct}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      <ul className="space-y-3">
        {LESSONS.map((lesson, i) => {
          const done = completed.has(lesson.id)
          return (
            <li key={lesson.id}>
              <Link
                to={`/learn/${lesson.id}`}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors group ${
                  done
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 hover:border-green-400'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                {/* Number / checkmark badge */}
                {done ? (
                  <span
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white font-bold text-sm shrink-0"
                    aria-label="Completed"
                  >
                    ✓
                  </span>
                ) : (
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-sm shrink-0">
                    {i + 1}
                  </span>
                )}

                <div className="flex-1 min-w-0">
                  <div
                    className={`font-semibold transition-colors ${
                      done
                        ? 'text-green-700 dark:text-green-400'
                        : 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`}
                  >
                    {lesson.title}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {lesson.description}
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

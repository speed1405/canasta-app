import { Link } from 'react-router-dom'
import { PageLayout } from '../components/PageLayout'

// Placeholder lesson data — replaced with real content in Phase 3
const LESSONS = [
  { id: 'intro', title: 'What is Canasta?', description: 'Objective and the 108-card deck' },
  { id: 'dealing', title: 'Dealing', description: '15 cards (2-player) or 13 cards (3-player)' },
  { id: 'turns', title: 'Turn Structure', description: 'Draw 2, then discard 1' },
  { id: 'pile', title: 'Picking Up the Pile', description: 'Frozen vs. unfrozen pile rules' },
  { id: 'melds', title: 'Forming Melds', description: 'Natural, mixed, and wild-card melds' },
  { id: 'canasta', title: 'Completing a Canasta', description: '7+ cards — natural (500 pts) vs. mixed (300 pts)' },
  { id: 'special', title: 'Special Cards', description: 'Jokers, 2s, red 3s, black 3s' },
  { id: 'initial-meld', title: 'Initial Meld Requirement', description: 'Minimum points by score bracket' },
  { id: 'going-out', title: 'Going Out', description: 'Conditions and bonuses (+100 or +200)' },
  { id: 'scoring', title: 'Scoring', description: 'Card values, canasta bonuses, penalties' },
]

export function LearnList() {
  return (
    <PageLayout title="Learn">
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        Work through the lessons to master every Canasta rule.
      </p>

      <ul className="space-y-3">
        {LESSONS.map((lesson, i) => (
          <li key={lesson.id}>
            <Link
              to={`/learn/${lesson.id}`}
              className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors group"
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-sm shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {lesson.title}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {lesson.description}
                </div>
              </div>
              <span className="text-slate-400 text-lg" aria-hidden="true">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </PageLayout>
  )
}

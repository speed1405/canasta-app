import { Link } from 'react-router-dom'
import { PageLayout } from '../components/PageLayout'

const SCENARIOS = [
  { id: 'initial-meld', title: 'Form an initial meld', description: 'Meet the minimum point requirement' },
  { id: 'frozen-pile', title: 'Frozen pile pickup', description: 'Which card lets you pick it up?' },
  { id: 'go-out', title: 'Should you go out?', description: 'You have 2 canastas — decide wisely' },
  { id: 'score-hand', title: 'Score this hand', description: 'Drag each group to the correct score category' },
  { id: 'red3-drawn', title: 'You drew a red 3', description: 'What do you do next?' },
  { id: 'concealed-out', title: 'Opponent went out concealed', description: 'How does scoring change?' },
  { id: 'freeze-pile', title: 'Freeze the pile', description: 'When should you discard a wild card?' },
  { id: 'black3-discard', title: 'Black 3 discard', description: 'Block the pile strategically' },
  { id: 'wild-card-limit', title: 'Wild-card limit', description: 'Can you add this wild to your meld?' },
  { id: 'minimum-meld-90', title: 'High-score initial meld', description: 'Score 1500+ pts — need 90 pts to open' },
]

export function PracticeList() {
  return (
    <PageLayout title="Practice">
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        Work through scenario drills to sharpen your Canasta skills.
      </p>

      <ul className="space-y-3">
        {SCENARIOS.map((scen, i) => (
          <li key={scen.id}>
            <Link
              to={`/practice/${scen.id}`}
              className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-500 transition-colors group"
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-bold text-sm shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {scen.title}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {scen.description}
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

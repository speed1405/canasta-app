import { Link } from 'react-router-dom'
import { PageLayout } from '../components/PageLayout'

export function PlayGame() {
  return (
    <PageLayout title="Game" backTo="/play" backLabel="← New Game">
      <div className="text-center py-16">
        <div className="text-5xl mb-4" aria-hidden="true">🎮</div>
        <h2 className="text-xl font-bold mb-2">Game Board</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          The full game board will be implemented in Phase 2.
        </p>
        <Link
          to="/play"
          className="inline-flex items-center px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
        >
          ← Back to setup
        </Link>
      </div>
    </PageLayout>
  )
}

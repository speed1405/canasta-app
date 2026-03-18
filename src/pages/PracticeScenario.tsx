import { useParams, Link } from 'react-router-dom'
import { PageLayout } from '../components/PageLayout'

export function PracticeScenario() {
  const { scenId } = useParams<{ scenId: string }>()

  return (
    <PageLayout title="Drill" backTo="/practice" backLabel="← Practice">
      <div className="text-center py-16">
        <div className="text-5xl mb-4" aria-hidden="true">🎯</div>
        <h2 className="text-xl font-bold mb-2">Scenario: {scenId}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Interactive drill content coming in Phase 4.
        </p>
        <Link
          to="/practice"
          className="inline-flex items-center px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
        >
          ← Back to drills
        </Link>
      </div>
    </PageLayout>
  )
}

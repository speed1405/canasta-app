import { useParams, Link } from 'react-router-dom'
import { PageLayout } from '../components/PageLayout'

export function LearnLesson() {
  const { lessonId } = useParams<{ lessonId: string }>()

  return (
    <PageLayout title="Lesson" backTo="/learn" backLabel="← Learn">
      <div className="text-center py-16">
        <div className="text-5xl mb-4" aria-hidden="true">📖</div>
        <h2 className="text-xl font-bold mb-2">Lesson: {lessonId}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Interactive lesson content coming in Phase 3.
        </p>
        <Link
          to="/learn"
          className="inline-flex items-center px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
        >
          ← Back to lessons
        </Link>
      </div>
    </PageLayout>
  )
}

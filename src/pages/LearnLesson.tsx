import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { PageLayout } from '../components/PageLayout'
import { LESSONS, getLessonById } from '../game/lessons'
import { markLessonComplete, isLessonComplete } from '../game/learnProgress'

export function LearnLesson() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()

  const lesson = getLessonById(lessonId ?? '')
  const lessonIndex = LESSONS.findIndex((l) => l.id === lessonId)
  const nextLesson = LESSONS[lessonIndex + 1] ?? null

  // Step state (0 = first step, lesson.steps.length = quiz)
  const [stepIndex, setStepIndex] = useState(0)

  // Quiz state
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)

  // Completion state
  const [alreadyComplete, setAlreadyComplete] = useState(false)

  useEffect(() => {
    if (lesson) setAlreadyComplete(isLessonComplete(lesson.id))
    setStepIndex(0)
    setSelectedOption(null)
    setAnswered(false)
  }, [lesson])

  if (!lesson) {
    return (
      <PageLayout title="Lesson" backTo="/learn" backLabel="← Learn">
        <div className="text-center py-16">
          <div className="text-5xl mb-4" aria-hidden="true">❓</div>
          <h2 className="text-xl font-bold mb-2">Lesson not found</h2>
          <Link to="/learn" className="text-blue-600 hover:underline">
            ← Back to lessons
          </Link>
        </div>
      </PageLayout>
    )
  }

  const totalSteps = lesson.steps.length
  const isQuizStep = stepIndex === totalSteps
  const currentStep = !isQuizStep ? lesson.steps[stepIndex] : null
  const isCorrect = answered && selectedOption === lesson.quiz.correctIndex

  // Progress percentage covers steps + quiz
  const progressPct = Math.round((stepIndex / (totalSteps + 1)) * 100)

  function handlePrev() {
    if (stepIndex > 0) setStepIndex((s) => s - 1)
  }

  function handleNext() {
    setStepIndex((s) => s + 1)
  }

  function handleAnswer(optionIndex: number) {
    if (answered || !lesson) return
    setSelectedOption(optionIndex)
    setAnswered(true)
    if (optionIndex === lesson.quiz.correctIndex) {
      markLessonComplete(lesson.id)
      setAlreadyComplete(true)
    }
  }

  function handleRetryQuiz() {
    setSelectedOption(null)
    setAnswered(false)
  }

  return (
    <PageLayout title={lesson.title} backTo="/learn" backLabel="← Learn">

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>{isQuizStep ? 'Quiz' : `Step ${stepIndex + 1} of ${totalSteps}`}</span>
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

      {/* Completed badge */}
      {alreadyComplete && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 text-sm">
          <span aria-hidden="true">✓</span>
          <span>You have completed this lesson</span>
        </div>
      )}

      {/* Step content */}
      {currentStep && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          {currentStep.icon && (
            <div className="text-4xl mb-4 text-center" aria-hidden="true">
              {currentStep.icon}
            </div>
          )}
          <h2 className="text-xl font-bold mb-3">{currentStep.title}</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {currentStep.body}
          </p>
        </div>
      )}

      {/* Quiz */}
      {isQuizStep && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="text-2xl mb-3 text-center" aria-hidden="true">🧠</div>
          <h2 className="text-lg font-bold mb-4">{lesson.quiz.question}</h2>

          <ul className="space-y-3 mb-4">
            {lesson.quiz.options.map((opt, idx) => {
              let btnClass =
                'w-full text-left px-4 py-3 rounded-xl border transition-colors '
              if (!answered) {
                btnClass += 'border-slate-200 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              } else if (idx === lesson.quiz.correctIndex) {
                btnClass += 'border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold'
              } else if (idx === selectedOption) {
                btnClass += 'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              } else {
                btnClass += 'border-slate-200 dark:border-slate-600 opacity-60'
              }
              return (
                <li key={idx}>
                  <button
                    className={btnClass}
                    onClick={() => handleAnswer(idx)}
                    disabled={answered}
                    aria-pressed={selectedOption === idx}
                  >
                    {opt.text}
                  </button>
                </li>
              )
            })}
          </ul>

          {answered && (
            <div
              className={`rounded-xl p-4 text-sm mb-4 ${
                isCorrect
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
                  : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
              }`}
            >
              <strong>{isCorrect ? '✓ Correct!' : '✗ Not quite.'}</strong>{' '}
              {lesson.quiz.explanation}
            </div>
          )}

          {answered && !isCorrect && (
            <button
              onClick={handleRetryQuiz}
              className="w-full py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm mb-2"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {stepIndex > 0 && (
          <button
            onClick={handlePrev}
            className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            ← Previous
          </button>
        )}

        {!isQuizStep && (
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            {stepIndex < totalSteps - 1 ? 'Next →' : 'Take the Quiz →'}
          </button>
        )}

        {isQuizStep && isCorrect && (
          nextLesson ? (
            <button
              onClick={() => navigate(`/learn/${nextLesson.id}`)}
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
            >
              Next lesson: {nextLesson.title} →
            </button>
          ) : (
            <Link
              to="/learn"
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors text-center"
            >
              🎉 All lessons complete! Back to list
            </Link>
          )
        )}
      </div>
    </PageLayout>
  )
}

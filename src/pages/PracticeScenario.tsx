import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { PageLayout } from '../components/PageLayout'
import { SCENARIOS, getScenarioById } from '../game/scenarios'
import { getScenarioResult, recordScenarioAttempt } from '../game/practiceProgress'

export function PracticeScenario() {
  const { scenId } = useParams<{ scenId: string }>()
  const navigate = useNavigate()

  const scenario = getScenarioById(scenId ?? '')
  const scenIndex = SCENARIOS.findIndex((s) => s.id === scenId)
  const nextScenario = SCENARIOS[scenIndex + 1] ?? null

  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [alreadyPassed, setAlreadyPassed] = useState(false)

  useEffect(() => {
    if (scenario) {
      const result = getScenarioResult(scenario.id)
      setAlreadyPassed(result?.passed ?? false)
    }
    setSelectedOption(null)
    setAnswered(false)
  }, [scenario])

  if (!scenario) {
    return (
      <PageLayout title="Drill" backTo="/practice" backLabel="← Practice">
        <div className="text-center py-16">
          <div className="text-5xl mb-4" aria-hidden="true">❓</div>
          <h2 className="text-xl font-bold mb-2">Drill not found</h2>
          <Link to="/practice" className="text-green-600 hover:underline">
            ← Back to drills
          </Link>
        </div>
      </PageLayout>
    )
  }

  const isCorrect = answered && selectedOption === scenario.correctIndex

  function handleAnswer(optionIndex: number) {
    if (answered) return
    setSelectedOption(optionIndex)
    setAnswered(true)
    const correct = optionIndex === scenario.correctIndex
    recordScenarioAttempt(scenario.id, correct)
    if (correct) setAlreadyPassed(true)
  }

  function handleTryAgain() {
    setSelectedOption(null)
    setAnswered(false)
  }

  return (
    <PageLayout title="Drill" backTo="/practice" backLabel="← Practice">

      {/* Scenario header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl" aria-hidden="true">{scenario.icon}</span>
        <div>
          <h2 className="text-xl font-bold">{scenario.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{scenario.description}</p>
        </div>
      </div>

      {/* Already passed badge */}
      {alreadyPassed && !answered && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 text-sm">
          <span aria-hidden="true">✓</span>
          <span>You have already passed this drill</span>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Scenario
        </h3>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {scenario.instructions}
        </p>
      </div>

      {/* Question + options */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h3 className="text-base font-bold mb-4">{scenario.question}</h3>

        <ul className="space-y-3 mb-4">
          {scenario.options.map((opt, idx) => {
            let btnClass =
              'w-full text-left px-4 py-3 rounded-xl border transition-colors '
            if (!answered) {
              btnClass +=
                'border-slate-200 dark:border-slate-600 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
            } else if (idx === scenario.correctIndex) {
              btnClass +=
                'border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold'
            } else if (idx === selectedOption) {
              btnClass +=
                'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
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

        {/* Feedback */}
        {answered && (
          <div
            className={`rounded-xl p-4 text-sm mb-4 ${
              isCorrect
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
            }`}
            role="status"
          >
            <strong>{isCorrect ? '✓ Correct!' : '✗ Not quite.'}</strong>{' '}
            {scenario.explanation}
          </div>
        )}

        {/* Try again */}
        {answered && !isCorrect && (
          <button
            onClick={handleTryAgain}
            className="w-full py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm mb-2"
          >
            Try again
          </button>
        )}
      </div>

      {/* Next drill / back buttons */}
      {answered && isCorrect && (
        <div className="flex gap-3">
          <Link
            to="/practice"
            className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium text-center"
          >
            ← All drills
          </Link>

          {nextScenario ? (
            <button
              onClick={() => navigate(`/practice/${nextScenario.id}`)}
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
            >
              Next drill: {nextScenario.title} →
            </button>
          ) : (
            <Link
              to="/practice"
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors text-center"
            >
              🎉 All drills complete! Back to list
            </Link>
          )}
        </div>
      )}
    </PageLayout>
  )
}

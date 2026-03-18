import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Slide {
  title: string
  description: string
  icon: string
  action?: string
  route?: string
}

const SLIDES: Slide[] = [
  {
    title: 'Welcome to Canasta!',
    description:
      'Canasta is a classic card game played with 2 decks (108 cards). '
      + 'This app teaches you to play, lets you practice key situations, '
      + 'and lets you play full games against an AI opponent.',
    icon: '🃏',
  },
  {
    title: 'Learn the Rules',
    description:
      'Never played Canasta before? Start with the interactive lessons. '
      + 'Each lesson covers a rule with a short explanation, a quiz question, '
      + 'and a hands-on exercise so you can practise right away.',
    icon: '📖',
    action: 'Go to Learn',
    route: '/learn',
  },
  {
    title: 'Practice Scenarios',
    description:
      'Already know the basics? Jump straight into curated drills — '
      + 'melding challenges, pile pickups, going-out decisions, and scoring exercises. '
      + 'Immediate feedback tells you if you got it right.',
    icon: '🎯',
    action: 'Go to Practice',
    route: '/practice',
  },
  {
    title: 'Play vs. AI',
    description:
      'Ready for a full game? Choose between 2-player and 3-player individual Canasta '
      + 'and pick your difficulty — from Beginner to Expert. '
      + 'The hint button always explains the best move.',
    icon: '🤖',
    action: 'Go to Play',
    route: '/play',
  },
]

const ONBOARDING_KEY = 'canasta_onboarding_done'

/** Mark onboarding as completed in localStorage. */
export function markOnboardingDone(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, '1')
  } catch {
    // ignore
  }
}

/** Has the user already seen the onboarding? */
export function isOnboardingDone(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1'
  } catch {
    return false
  }
}

export interface OnboardingProps {
  onComplete?: () => void
}

/**
 * First-run onboarding flow: four intro slides shown once per device.
 * The final slide lets the user pick a starting section (Learn / Practice / Play).
 */
export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const slide = SLIDES[step]
  const isLast = step === SLIDES.length - 1

  function finish(route?: string) {
    markOnboardingDone()
    onComplete?.()
    if (route) {
      navigate(route)
    } else {
      navigate('/')
    }
  }

  function next() {
    if (step < SLIDES.length - 1) {
      setStep((s) => s + 1)
    } else {
      finish()
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 flex flex-col gap-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2" aria-label="Progress">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === step ? 'bg-blue-600' : 'bg-slate-300'
              }`}
              aria-current={i === step ? 'step' : undefined}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="text-6xl text-center" aria-hidden="true">
          {slide.icon}
        </div>

        {/* Text */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {slide.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
            {slide.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {/* Section shortcut on last slide */}
          {isLast && SLIDES.filter((s) => s.route).map((s) => (
            <button
              key={s.route}
              onClick={() => finish(s.route)}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
            >
              {s.action}
            </button>
          ))}

          {/* Next / Skip */}
          <div className="flex gap-3">
            <button
              onClick={() => finish()}
              className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
            >
              Skip intro
            </button>
            {!isLast && (
              <button
                onClick={next}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

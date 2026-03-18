import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageLayout } from '../components/PageLayout'
import type { AIDifficulty, Variant } from '../game/types'

const DIFFICULTIES: { value: AIDifficulty; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'Random moves — perfect for learning the interface' },
  { value: 'easy', label: 'Easy', description: 'Legal moves, basic strategy — low-pressure game' },
  { value: 'medium', label: 'Medium', description: 'Builds canastas, avoids bad discards — genuine challenge' },
  { value: 'hard', label: 'Hard', description: 'Card-counting, pile control — tactical play' },
  { value: 'expert', label: 'Expert', description: 'Tournament-strength AI — minimax + Bayesian hand model' },
]

export function PlaySetup() {
  const navigate = useNavigate()
  const [variant, setVariant] = useState<Variant>('2p')
  const [difficulty, setDifficulty] = useState<AIDifficulty>('easy')

  function startGame() {
    // Game state will be initialised by the play/game page
    navigate(`/play/game?variant=${variant}&difficulty=${difficulty}`)
  }

  return (
    <PageLayout title="New Game">
      <div className="space-y-8">
        {/* Variant selector */}
        <section>
          <h2 className="text-lg font-bold mb-3">Game variant</h2>
          <div className="grid grid-cols-2 gap-3">
            {(['2p', '3p'] as Variant[]).map((v) => (
              <button
                key={v}
                onClick={() => setVariant(v)}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  variant === v
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
                aria-pressed={variant === v}
              >
                <div className="font-bold">{v === '2p' ? '2-Player' : '3-Player'}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {v === '2p' ? '15 cards dealt' : '13 cards dealt'}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Difficulty selector */}
        <section>
          <h2 className="text-lg font-bold mb-3">AI difficulty</h2>
          <ul className="space-y-2">
            {DIFFICULTIES.map((d) => (
              <li key={d.value}>
                <button
                  onClick={() => setDifficulty(d.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
                    difficulty === d.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                  aria-pressed={difficulty === d.value}
                >
                  <div className="font-semibold">{d.label}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {d.description}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Start button */}
        <button
          onClick={startGame}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-lg font-bold transition-colors"
        >
          Start Game
        </button>
      </div>
    </PageLayout>
  )
}

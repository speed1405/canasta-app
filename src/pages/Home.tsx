import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Onboarding, isOnboardingDone } from '../components/Onboarding'
import { ChangelogModal } from '../components/ChangelogModal'
import { shouldShowChangelog } from '../game/changelogVersion'

const NAV_ITEMS = [
  { label: 'Learn', route: '/learn', icon: '📖', description: 'Interactive lessons for every Canasta rule' },
  { label: 'Practice', route: '/practice', icon: '🎯', description: 'Curated scenario drills with instant feedback' },
  { label: 'Play', route: '/play', icon: '🎮', description: 'Full games vs. AI — 2-player or 3-player' },
  { label: 'Reference', route: '/reference', icon: '📋', description: 'Quick rules & scoring cheat sheet' },
  { label: 'Stats', route: '/stats', icon: '📊', description: 'Your personal game history & statistics' },
  { label: 'Settings', route: '/settings', icon: '⚙️', description: 'Sound, animations, and theme preferences' },
]

export function Home() {
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingDone())
  const [showChangelog, setShowChangelog] = useState(() => isOnboardingDone() && shouldShowChangelog())

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
      {!showOnboarding && showChangelog && (
        <ChangelogModal onClose={() => setShowChangelog(false)} />
      )}

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="text-6xl mb-4" aria-hidden="true">🃏</div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">Canasta</h1>
          <p className="text-slate-300 text-lg">Learn, practice, and master the classic card game</p>
        </header>

        {/* Navigation grid */}
        <nav aria-label="Main navigation">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {NAV_ITEMS.map((item) => (
              <li key={item.route}>
                <Link
                  to={item.route}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors border border-white/10 hover:border-white/20 group"
                  aria-label={`${item.label} — ${item.description}`}
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform" aria-hidden="true">
                    {item.icon}
                  </span>
                  <div>
                    <div className="font-bold text-lg">{item.label}</div>
                    <div className="text-slate-400 text-sm">{item.description}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

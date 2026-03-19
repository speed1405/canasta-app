import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Onboarding, isOnboardingDone } from '../components/Onboarding'
import { ChangelogModal } from '../components/ChangelogModal'
import { shouldShowChangelog } from '../game/changelogVersion'
import { useAuth } from '../auth/AuthContext'

interface MenuItem {
  label: string
  route: string
  icon: string
  description: string
}

interface MenuSection {
  heading: string
  items: MenuItem[]
}

const MENU_SECTIONS: MenuSection[] = [
  {
    heading: 'Play',
    items: [
      { label: 'Play vs AI', route: '/play', icon: '🎮', description: 'Full games vs. AI — 2-player or 3-player' },
      { label: 'Multiplayer', route: '/lobby', icon: '🌐', description: 'Play online against real people' },
      { label: 'Tournaments', route: '/tournaments', icon: '🏆', description: 'Compete in round-robin or bracket tournaments' },
    ],
  },
  {
    heading: 'Learn & Practice',
    items: [
      { label: 'Learn', route: '/learn', icon: '📖', description: 'Interactive lessons for every Canasta rule' },
      { label: 'Practice', route: '/practice', icon: '🎯', description: 'Curated scenario drills with instant feedback' },
      { label: 'Challenges', route: '/challenges', icon: '⚡', description: 'Daily & weekly challenges — same hand for everyone' },
    ],
  },
  {
    heading: 'Community',
    items: [
      { label: 'Leaderboards', route: '/leaderboards', icon: '🏅', description: 'Global Elo rankings by variant' },
      { label: 'Stats', route: '/stats', icon: '📊', description: 'Your personal game history & statistics' },
    ],
  },
  {
    heading: 'More',
    items: [
      { label: 'Reference', route: '/reference', icon: '📋', description: 'Quick rules & scoring cheat sheet' },
      { label: 'Settings', route: '/settings', icon: '⚙️', description: 'Sound, animations, and theme preferences' },
    ],
  },
]

function MenuCard({ item, featured = false }: { item: MenuItem; featured?: boolean }) {
  return (
    <Link
      to={item.route}
      className={
        featured
          ? 'flex items-center gap-4 p-6 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors border border-blue-400/30 group w-full'
          : 'flex items-center gap-4 p-5 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors border border-white/10 hover:border-white/20 group'
      }
      aria-label={`${item.label} — ${item.description}`}
    >
      <span className="text-3xl group-hover:scale-110 transition-transform" aria-hidden="true">
        {item.icon}
      </span>
      <div>
        <div className={`font-bold text-lg ${featured ? 'text-white' : ''}`}>{item.label}</div>
        <div className={`text-sm ${featured ? 'text-blue-100' : 'text-slate-400'}`}>{item.description}</div>
      </div>
    </Link>
  )
}

export function Home() {
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingDone())
  const [showChangelog, setShowChangelog] = useState(() => isOnboardingDone() && shouldShowChangelog())
  const { currentUser } = useAuth()

  const [playSection, learnSection, communitySection, moreSection] = MENU_SECTIONS

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
      {!showOnboarding && showChangelog && (
        <ChangelogModal onClose={() => setShowChangelog(false)} />
      )}

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="text-6xl mb-3" aria-hidden="true">🃏</div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">Canasta</h1>
          <p className="text-slate-300 text-lg">Learn, practice, and master the classic card game</p>

          {/* Account area */}
          <div className="mt-4">
            {currentUser ? (
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
                aria-label="View your profile"
              >
                <span aria-hidden="true">👤</span>
                {currentUser.displayName ?? currentUser.email ?? 'Profile'}
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
                aria-label="Sign in to sync your progress"
              >
                <span aria-hidden="true">🔑</span>
                Sign In
              </Link>
            )}
          </div>
        </header>

        {/* Main Menu */}
        <nav aria-label="Main menu">
          {/* Play section — featured primary action */}
          <section aria-labelledby="section-play" className="mb-8">
            <h2 id="section-play" className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
              {playSection.heading}
            </h2>
            <ul className="flex flex-col gap-3">
              {playSection.items.map((item, idx) => (
                <li key={item.route}>
                  <MenuCard item={item} featured={idx === 0} />
                </li>
              ))}
            </ul>
          </section>

          {/* Learn & Practice */}
          <section aria-labelledby="section-learn" className="mb-8">
            <h2 id="section-learn" className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
              {learnSection.heading}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {learnSection.items.map((item) => (
                <li key={item.route}>
                  <MenuCard item={item} />
                </li>
              ))}
            </ul>
          </section>

          {/* Community */}
          <section aria-labelledby="section-community" className="mb-8">
            <h2 id="section-community" className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
              {communitySection.heading}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {communitySection.items.map((item) => (
                <li key={item.route}>
                  <MenuCard item={item} />
                </li>
              ))}
            </ul>
          </section>

          {/* More */}
          <section aria-labelledby="section-more">
            <h2 id="section-more" className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
              {moreSection.heading}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {moreSection.items.map((item) => (
                <li key={item.route}>
                  <MenuCard item={item} />
                </li>
              ))}
            </ul>
          </section>
        </nav>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Onboarding, isOnboardingDone } from '../components/Onboarding'
import { ChangelogModal } from '../components/ChangelogModal'
import { shouldShowChangelog, CURRENT_VERSION } from '../game/changelogVersion'
import { useAuth } from '../auth/AuthContext'

interface MenuItem {
  label: string
  route: string
  icon: string
  description: string
}

interface MenuSection {
  heading: string
  sectionIcon: string
  items: MenuItem[]
}

const MENU_SECTIONS: MenuSection[] = [
  {
    heading: 'Play',
    sectionIcon: '🎮',
    items: [
      { label: 'Play vs AI', route: '/play', icon: '🎮', description: 'Full games vs. AI — 2-player, 3-player, or 4-player' },
      { label: 'Multiplayer', route: '/lobby', icon: '🌐', description: 'Play online against real people' },
      { label: 'Tournaments', route: '/tournaments', icon: '🏆', description: 'Compete in round-robin or bracket tournaments' },
      { label: 'Watch AI Play', route: '/spectator', icon: '👁️', description: 'Spectator mode — watch AI vs AI with live commentary' },
    ],
  },
  {
    heading: 'Learn & Practice',
    sectionIcon: '📚',
    items: [
      { label: 'Learn', route: '/learn', icon: '📖', description: 'Interactive lessons for every Canasta rule' },
      { label: 'Practice', route: '/practice', icon: '🎯', description: 'Curated scenario drills with instant feedback' },
      { label: 'Challenges', route: '/challenges', icon: '⚡', description: 'Daily & weekly challenges — same hand for everyone' },
    ],
  },
  {
    heading: 'Community',
    sectionIcon: '🌍',
    items: [
      { label: 'Leaderboards', route: '/leaderboards', icon: '🏅', description: 'Global Elo rankings by variant' },
      { label: 'Stats', route: '/stats', icon: '📊', description: 'Your personal game history & statistics' },
    ],
  },
  {
    heading: 'More',
    sectionIcon: '⚙️',
    items: [
      { label: 'Reference', route: '/reference', icon: '📋', description: 'Quick rules & scoring cheat sheet' },
      { label: 'Settings', route: '/settings', icon: '⚙️', description: 'Sound, animations, and theme preferences' },
    ],
  },
]

function MenuCard({ item, featured = false }: { item: MenuItem; featured?: boolean }) {
  if (featured) {
    return (
      <Link
        to={item.route}
        className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 active:from-blue-700 active:to-blue-600 transition-all duration-200 border border-blue-400/40 shadow-lg shadow-blue-900/30 group w-full"
        aria-label={`${item.label} — ${item.description}`}
      >
        <span className="text-4xl group-hover:scale-110 transition-transform duration-200 drop-shadow" aria-hidden="true">
          {item.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-xl text-white">{item.label}</div>
          <div className="text-sm text-blue-100 mt-0.5 truncate">{item.description}</div>
        </div>
        <span className="text-blue-200 group-hover:translate-x-1 transition-transform duration-200 text-xl" aria-hidden="true">›</span>
      </Link>
    )
  }

  return (
    <Link
      to={item.route}
      className="flex items-center gap-3 p-4 rounded-xl bg-white/8 hover:bg-white/15 active:bg-white/20 transition-all duration-150 border border-white/10 hover:border-white/25 group"
      aria-label={`${item.label} — ${item.description}`}
    >
      <span className="text-2xl group-hover:scale-110 transition-transform duration-200 shrink-0" aria-hidden="true">
        {item.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-base text-white leading-tight">{item.label}</div>
        <div className="text-xs text-slate-400 mt-0.5 leading-snug">{item.description}</div>
      </div>
      <span className="text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all duration-150" aria-hidden="true">›</span>
    </Link>
  )
}

export function Home() {
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingDone())
  const [showChangelog, setShowChangelog] = useState(() => isOnboardingDone() && shouldShowChangelog())
  const { currentUser } = useAuth()

  const [playSection, learnSection, communitySection, moreSection] = MENU_SECTIONS

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white">
      {showOnboarding && (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      )}
      {!showOnboarding && showChangelog && (
        <ChangelogModal onClose={() => setShowChangelog(false)} />
      )}

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <header className="text-center mb-10">
          {/* Decorative card suits */}
          <div className="flex justify-center gap-4 mb-3 text-2xl select-none" aria-hidden="true">
            <span className="text-red-400 opacity-60">♥</span>
            <span className="text-slate-300 opacity-40">♠</span>
            <span className="text-4xl animate-float">🃏</span>
            <span className="text-slate-300 opacity-40">♣</span>
            <span className="text-red-400 opacity-60">♦</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 tracking-tight">Canasta</h1>
          <p className="text-slate-400 text-base">Learn, practice, and master the classic card game</p>

          {/* Account area */}
          <div className="mt-5">
            {currentUser ? (
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/18 border border-white/10 hover:border-white/20 text-sm font-medium transition-all"
                aria-label="View your profile"
              >
                <span aria-hidden="true">👤</span>
                {currentUser.displayName ?? currentUser.email ?? 'Profile'}
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/18 border border-white/10 hover:border-white/20 text-sm font-medium transition-all"
                aria-label="Sign in to sync your progress"
              >
                <span aria-hidden="true">🔑</span>
                Sign In
              </Link>
            )}
          </div>
        </header>

        {/* Main Menu */}
        <nav aria-label="Main menu" className="space-y-8">
          {/* Play section — featured primary action */}
          <section aria-labelledby="section-play">
            <SectionHeading id="section-play" icon={playSection.sectionIcon} label={playSection.heading} />
            <ul className="flex flex-col gap-3">
              {playSection.items.map((item, idx) => (
                <li key={item.route}>
                  <MenuCard item={item} featured={idx === 0} />
                </li>
              ))}
            </ul>
          </section>

          <Divider />

          {/* Learn & Practice */}
          <section aria-labelledby="section-learn">
            <SectionHeading id="section-learn" icon={learnSection.sectionIcon} label={learnSection.heading} />
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {learnSection.items.map((item) => (
                <li key={item.route}>
                  <MenuCard item={item} />
                </li>
              ))}
            </ul>
          </section>

          <Divider />

          {/* Community */}
          <section aria-labelledby="section-community">
            <SectionHeading id="section-community" icon={communitySection.sectionIcon} label={communitySection.heading} />
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {communitySection.items.map((item) => (
                <li key={item.route}>
                  <MenuCard item={item} />
                </li>
              ))}
            </ul>
          </section>

          <Divider />

          {/* More */}
          <section aria-labelledby="section-more">
            <SectionHeading id="section-more" icon={moreSection.sectionIcon} label={moreSection.heading} />
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {moreSection.items.map((item) => (
                <li key={item.route}>
                  <MenuCard item={item} />
                </li>
              ))}
            </ul>
          </section>
        </nav>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-slate-600">
          v{CURRENT_VERSION}
        </footer>
      </div>
    </div>
  )
}

function SectionHeading({ id, icon, label }: { id: string; icon: string; label: string }) {
  return (
    <h2
      id={id}
      className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3"
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </h2>
  )
}

function Divider() {
  return <hr className="border-white/8" aria-hidden="true" />
}

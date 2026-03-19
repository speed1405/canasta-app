import { markChangelogSeen } from '../game/changelogVersion'

interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
}

const ENTRIES: ChangelogEntry[] = [
  {
    version: '1.5.0',
    date: 'March 2026',
    changes: [
      '✨ New: Neural AI difficulty — next-generation AI with aggressive pile grabs and near-perfect discard strategy',
      '🏆 New: Tournaments — create and join round-robin or single-elimination bracket tournaments',
      '🏅 New: Global Leaderboards — Elo-rated rankings for overall play and each game variant',
      '📊 Elo rating system — your rating updates after every multiplayer and tournament match',
    ],
  },
  {
    version: '1.4.0',
    date: 'March 2026',
    changes: [
      '🌐 New: Online Multiplayer — play against real people with a shareable 6-character room code!',
      '⏱️ Turn timer — 60-second countdown per turn; auto-discards on timeout',
      '💬 In-game chat — send messages to opponents during a match (profanity filter applied)',
      '🔌 Disconnection detection — shows reconnect indicator when a player goes offline',
      '📊 Post-game summary with scores shown after each multiplayer match',
    ],
  },
  {
    version: '1.3.0',
    date: 'March 2026',
    changes: [
      '🤝 New: 4-Player Partnership (2 vs 2) — team up with an AI partner against two opponents!',
      '🏆 Shared team melds — you and your partner build melds together; add cards to each other\'s sets',
      '🙋 Ask-partner permission — if your partner needs more canastas, ask before going out',
      '📊 Team scoring display — round-end screen now shows team totals for partnership games',
      '🤖 Cooperative AI partner — the AI partner prioritises completing your shared team melds',
    ],
  },
  {
    version: '1.2.0',
    date: 'March 2026',
    changes: [
      '☁️ New: Cloud accounts — register or sign in with email/Google to sync your stats, lessons, and practice progress across devices',
      '👤 New Profile page — manage your display name, view account details, and sign out',
      '🔄 Guest-to-account merge — your local progress is automatically uploaded when you create an account',
      '🗑 Delete My Account — remove all your cloud data at any time from your Profile page',
      '🔒 Privacy Policy page added',
    ],
  },
  {
    version: '1.1.0',
    date: 'March 2026',
    changes: [
      '🎯 Added 5 new Practice Mode drills — pile pickup, canasta types, going-out rules, discard strategy, and wild-card meld rules (15 drills total)',
      '📋 New "Tips & Strategy" section in the Reference screen with intermediate tactics',
      '🔄 Improved onboarding: returning players skip straight to the home screen',
      '♿ Accessibility improvements across card and modal components',
    ],
  },
  {
    version: '1.0.0',
    date: 'January 2026',
    changes: [
      '🃏 Full 2-player and 3-player Canasta vs. AI',
      '📖 10 interactive Learn Mode lessons',
      '🎯 10 Practice Mode scenario drills',
      '📋 Reference screen with scoring cheat sheet',
      '📊 Personal stats and game history',
      '🌙 Dark mode support',
    ],
  },
]

interface ChangelogModalProps {
  onClose: () => void
}

/**
 * "What's New" modal — shown once per app version, then suppressed until the
 * next release bumps CURRENT_VERSION in changelogVersion.ts.
 */
export function ChangelogModal({ onClose }: ChangelogModalProps) {
  function handleClose() {
    markChangelogSeen()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/70 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="changelog-title"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-y-auto max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <h2
            id="changelog-title"
            className="text-xl font-bold text-slate-900 dark:text-white"
          >
            🎉 What's New
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close changelog"
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Entries */}
        <div className="px-6 py-4 space-y-6 overflow-y-auto flex-1">
          {ENTRIES.map((entry) => (
            <div key={entry.version}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  v{entry.version}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {entry.date}
                </span>
              </div>
              <ul className="space-y-1.5">
                {entry.changes.map((change, i) => (
                  <li
                    key={i}
                    className="text-sm text-slate-700 dark:text-slate-300"
                  >
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleClose}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}

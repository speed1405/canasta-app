import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageLayout } from '../components/PageLayout'
import { useAuth } from '../auth/AuthContext'
import { saveCloudPreferences, loadCloudPreferences } from '../auth/cloudSync'
import { getAvailableThemes, getSavedThemeId, saveThemeId, applyTheme, getThemeById } from '../themes/themeService'

type AnimSpeed = 'off' | 'normal' | 'fast'
type Theme = 'system' | 'light' | 'dark'

interface Preferences {
  sound: boolean
  animSpeed: AnimSpeed
  theme: Theme
}

const PREFS_KEY = 'canasta_prefs'

function loadPrefs(): Preferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return JSON.parse(raw) as Preferences
  } catch { /* ignore */ }
  return { sound: true, animSpeed: 'normal', theme: 'system' }
}

function savePrefs(prefs: Preferences): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch { /* ignore */ }
}

export function Settings() {
  const [prefs, setPrefs] = useState<Preferences>(loadPrefs)
  const { currentUser } = useAuth()
  const [cardThemeId, setCardThemeId] = useState<string>(getSavedThemeId)
  const cardThemes = getAvailableThemes()

  // Load cloud preferences when a user signs in
  useEffect(() => {
    if (!currentUser) return
    loadCloudPreferences(currentUser).then((cloudPrefs) => {
      if (cloudPrefs) {
        const merged = { ...loadPrefs(), ...cloudPrefs } as Preferences
        setPrefs(merged)
        savePrefs(merged)
      }
    }).catch(() => { /* ignore */ })
  }, [currentUser])

  useEffect(() => {
    savePrefs(prefs)
    if (currentUser) {
      saveCloudPreferences(currentUser, prefs as unknown as Record<string, unknown>).catch(() => { /* ignore */ })
    }
    // Apply theme
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    if (prefs.theme !== 'system') {
      root.classList.add(prefs.theme)
    }
    // Apply animation speed as a CSS custom property
    const speedMap: Record<AnimSpeed, string> = { off: '0ms', normal: '300ms', fast: '100ms' }
    root.style.setProperty('--anim-speed', speedMap[prefs.animSpeed])
  }, [prefs, currentUser])

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPrefs((p) => ({ ...p, [key]: value }))
  }

  function handleCardThemeChange(id: string) {
    setCardThemeId(id)
    saveThemeId(id)
    applyTheme(getThemeById(id))
  }

  return (
    <PageLayout title="Settings">
      <div className="space-y-8">
        {/* Sound */}
        <section aria-labelledby="sound-label">
          <h2 id="sound-label" className="text-lg font-bold mb-4">Sound</h2>
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <div className="font-semibold">Sound effects</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Card deal, meld, canasta, going out</div>
            </div>
            <button
              role="switch"
              aria-checked={prefs.sound}
              onClick={() => update('sound', !prefs.sound)}
              className={`relative w-12 h-7 rounded-full transition-colors ${prefs.sound ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
              aria-label="Sound effects"
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${prefs.sound ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </section>

        {/* Animation speed */}
        <section aria-labelledby="anim-label">
          <h2 id="anim-label" className="text-lg font-bold mb-4">Animation speed</h2>
          <div className="grid grid-cols-3 gap-2">
            {(['off', 'normal', 'fast'] as AnimSpeed[]).map((speed) => (
              <button
                key={speed}
                onClick={() => update('animSpeed', speed)}
                className={`py-3 rounded-xl border-2 capitalize font-semibold transition-colors ${
                  prefs.animSpeed === speed
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
                aria-pressed={prefs.animSpeed === speed}
              >
                {speed}
              </button>
            ))}
          </div>
        </section>

        {/* Colour theme */}
        <section aria-labelledby="theme-label">
          <h2 id="theme-label" className="text-lg font-bold mb-4">Colour theme</h2>
          <div className="grid grid-cols-3 gap-2">
            {(['system', 'light', 'dark'] as Theme[]).map((theme) => {
              const icons: Record<Theme, string> = {
                system: '🖥️',
                light: '☀️',
                dark: '🌙',
              }
              return (
                <button
                  key={theme}
                  onClick={() => update('theme', theme)}
                  className={`py-3 rounded-xl border-2 capitalize font-semibold transition-colors ${
                    prefs.theme === theme
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                  aria-pressed={prefs.theme === theme}
                >
                  <span aria-hidden="true">{icons[theme]}</span>{' '}{theme}
                </button>
              )
            })}
          </div>
        </section>

        {/* Card theme */}
        <section aria-labelledby="card-theme-label">
          <h2 id="card-theme-label" className="text-lg font-bold mb-4">Card theme</h2>
          <div className="grid grid-cols-3 gap-2">
            {cardThemes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleCardThemeChange(t.id)}
                className={`py-3 rounded-xl border-2 font-semibold transition-colors ${
                  cardThemeId === t.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
                aria-pressed={cardThemeId === t.id}
              >
                <span aria-hidden="true">{t.icon}</span>{' '}{t.name}
              </button>
            ))}
          </div>
        </section>

        {/* Account */}
        <section aria-labelledby="account-label">
          <h2 id="account-label" className="text-lg font-bold mb-4">Account</h2>
          {currentUser ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
              <div className="p-4 flex items-center gap-3">
                <span className="text-xl" aria-hidden="true">✅</span>
                <div>
                  <div className="font-semibold text-sm">Signed in</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                    {currentUser.email}
                  </div>
                </div>
              </div>
              <div className="p-4 text-sm text-slate-500 dark:text-slate-400">
                Your stats, progress, and preferences are synced across devices.
              </div>
              <div className="p-4 flex flex-col gap-2">
                <Link
                  to="/profile"
                  className="block text-center py-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sign in to sync your stats, lesson progress, and practice results across devices.
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className="block text-center py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block text-center py-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  )
}

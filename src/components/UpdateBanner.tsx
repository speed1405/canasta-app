import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Displays a sticky banner when a new service-worker version is waiting.
 * The user can tap "Reload" to apply the update immediately.
 */
export function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 bg-blue-700 px-4 py-3 text-white shadow-lg sm:rounded-t-xl"
    >
      <span className="text-sm font-medium">
        🔄 Update available — tap Reload for the latest version.
      </span>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => { void updateServiceWorker(true) }}
          className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 active:bg-blue-100 transition-colors"
        >
          Reload
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="rounded-lg border border-blue-400 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-600 active:bg-blue-800 transition-colors"
          aria-label="Dismiss update banner"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

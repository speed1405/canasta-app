/**
 * AchievementToast — fires a brief notification when the player unlocks
 * a new achievement.
 *
 * Subscribe to the achievement service's callback once at the app level
 * and render this component; it self-dismisses after 4 seconds.
 */

import { useState, useEffect, useCallback } from 'react'
import { onAchievementUnlock } from '../achievements/achievementService'
import { getAchievementById } from '../achievements/achievements'

interface ToastItem {
  id: string
  achievementId: string
}

export function AchievementToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    const unsub = onAchievementUnlock((achievementId) => {
      const toastId = crypto.randomUUID()
      setToasts((prev) => [...prev, { id: toastId, achievementId }])
      setTimeout(() => dismiss(toastId), 4000)
    })
    return unsub
  }, [dismiss])

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-label="Achievement notifications"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none"
    >
      {toasts.map((t) => {
        const def = getAchievementById(t.achievementId)
        if (!def) return null
        return (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl bg-yellow-400 text-yellow-900 shadow-xl font-semibold text-sm animate-bounce-in"
          >
            <span className="text-2xl" aria-hidden="true">{def.icon}</span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wide opacity-70">Achievement Unlocked!</div>
              <div>{def.title}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

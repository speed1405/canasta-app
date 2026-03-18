import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { RegisterSWOptions } from 'vite-plugin-pwa/types'

export type { RegisterSWOptions }

export function useRegisterSW(_options?: RegisterSWOptions): {
  needRefresh: [boolean, Dispatch<SetStateAction<boolean>>]
  offlineReady: [boolean, Dispatch<SetStateAction<boolean>>]
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>
} {
  const needRefresh = useState(false)
  const offlineReady = useState(false)
  return {
    needRefresh,
    offlineReady,
    updateServiceWorker: async () => { /* no-op in tests */ },
  }
}

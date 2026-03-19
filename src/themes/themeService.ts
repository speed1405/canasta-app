/**
 * Card theme service.
 *
 * - Persists the selected theme ID to localStorage.
 * - Applies the theme CSS variables to the document root so all card
 *   components pick them up via var(--card-face-bg) etc.
 */

import type { CardTheme } from './types'
import { BUILT_IN_THEMES, DEFAULT_THEME_ID } from './themes'

const STORAGE_KEY = 'canasta_card_theme'

export function getAvailableThemes(): CardTheme[] {
  return BUILT_IN_THEMES
}

export function getSavedThemeId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME_ID
  } catch {
    return DEFAULT_THEME_ID
  }
}

export function saveThemeId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch { /* ignore */ }
}

export function getThemeById(id: string): CardTheme {
  return BUILT_IN_THEMES.find((t) => t.id === id) ?? BUILT_IN_THEMES[0]
}

/** Inject CSS custom properties for the given theme onto the document root. */
export function applyTheme(theme: CardTheme): void {
  const root = document.documentElement
  for (const [varName, value] of Object.entries(theme.cssVars)) {
    root.style.setProperty(varName, value)
  }
}

/** Load persisted theme and apply it. Call once at app startup. */
export function initTheme(): void {
  const id = getSavedThemeId()
  const theme = getThemeById(id)
  applyTheme(theme)
}

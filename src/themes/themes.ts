import type { CardTheme } from './types'

/** Classic theme — traditional white cards with red/black suits. */
const classic: CardTheme = {
  id: 'classic',
  name: 'Classic',
  icon: '🃏',
  cssVars: {
    '--card-face-bg': '#ffffff',
    '--card-back-bg': '#1e3a8a',
    '--card-back-accent': '#3b82f6',
    '--card-border': '#cbd5e1',
    '--card-red': '#dc2626',
    '--card-black': '#1e293b',
  },
}

/** Minimalist theme — off-white faces, slate backs, muted suits. */
const minimalist: CardTheme = {
  id: 'minimalist',
  name: 'Minimalist',
  icon: '⬜',
  cssVars: {
    '--card-face-bg': '#f8fafc',
    '--card-back-bg': '#475569',
    '--card-back-accent': '#94a3b8',
    '--card-border': '#e2e8f0',
    '--card-red': '#e11d48',
    '--card-black': '#334155',
  },
}

/** Festive theme — cream faces, deep-red backs, gold accents. */
const festive: CardTheme = {
  id: 'festive',
  name: 'Festive',
  icon: '🎄',
  cssVars: {
    '--card-face-bg': '#fffbeb',
    '--card-back-bg': '#991b1b',
    '--card-back-accent': '#fbbf24',
    '--card-border': '#fcd34d',
    '--card-red': '#b91c1c',
    '--card-black': '#1c1917',
  },
}

export const BUILT_IN_THEMES: CardTheme[] = [classic, minimalist, festive]

export const DEFAULT_THEME_ID = 'classic'

/** Types for the Card Themes system. */

export interface CardTheme {
  /** Unique theme identifier. */
  id: string
  /** Human-readable label. */
  name: string
  /** Emoji or short label shown in theme picker. */
  icon: string
  /** CSS variables this theme injects on the root element. */
  cssVars: {
    /** Card face background colour. */
    '--card-face-bg': string
    /** Card back background colour. */
    '--card-back-bg': string
    /** Card back pattern / secondary colour. */
    '--card-back-accent': string
    /** Border colour for cards. */
    '--card-border': string
    /** Red suit colour. */
    '--card-red': string
    /** Black suit colour. */
    '--card-black': string
  }
}

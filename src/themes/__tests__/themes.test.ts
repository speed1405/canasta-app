import { describe, it, expect } from 'vitest'
import { BUILT_IN_THEMES, DEFAULT_THEME_ID } from '../themes'

describe('themes', () => {
  it('has at least 3 built-in themes', () => {
    expect(BUILT_IN_THEMES.length).toBeGreaterThanOrEqual(3)
  })

  it('theme ids are unique', () => {
    const ids = BUILT_IN_THEMES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every theme has required CSS variables', () => {
    const requiredVars = [
      '--card-face-bg',
      '--card-back-bg',
      '--card-back-accent',
      '--card-border',
      '--card-red',
      '--card-black',
    ] as const
    for (const theme of BUILT_IN_THEMES) {
      for (const v of requiredVars) {
        expect(theme.cssVars[v]).toBeTruthy()
      }
    }
  })

  it('every theme has a name and icon', () => {
    for (const theme of BUILT_IN_THEMES) {
      expect(theme.name.length).toBeGreaterThan(0)
      expect(theme.icon.length).toBeGreaterThan(0)
    }
  })

  it('default theme id is one of the built-in themes', () => {
    const ids = BUILT_IN_THEMES.map((t) => t.id)
    expect(ids).toContain(DEFAULT_THEME_ID)
  })

  it('includes classic, minimalist and a festive theme', () => {
    const ids = BUILT_IN_THEMES.map((t) => t.id)
    expect(ids).toContain('classic')
    expect(ids).toContain('minimalist')
    expect(ids).toContain('festive')
  })
})

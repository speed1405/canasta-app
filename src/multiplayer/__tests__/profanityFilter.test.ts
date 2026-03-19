import { describe, it, expect } from 'vitest'
import { filterText, containsProfanity } from '../profanityFilter'

describe('filterText', () => {
  it('replaces blocked word with asterisks', () => {
    expect(filterText('what the fuck')).toBe('what the ****')
  })
  it('is case-insensitive', () => {
    expect(filterText('FUCK')).toBe('****')
  })
  it('preserves clean text', () => {
    expect(filterText('nice move!')).toBe('nice move!')
  })
  it('replaces multiple blocked words', () => {
    expect(filterText('shit that was a damn good move')).toBe('**** that was a **** good move')
  })
  it('does not replace partial word matches', () => {
    expect(filterText('class')).toBe('class')
    expect(filterText('assume')).toBe('assume')
    expect(filterText('assessment')).toBe('assessment')
  })
})

describe('containsProfanity', () => {
  it('returns true for blocked word', () => {
    expect(containsProfanity('shit happens')).toBe(true)
  })
  it('returns false for clean text', () => {
    expect(containsProfanity('great game')).toBe(false)
  })
  it('returns true regardless of case', () => {
    expect(containsProfanity('DAMN that was close')).toBe(true)
  })
  it('returns false for partial matches', () => {
    expect(containsProfanity('classic')).toBe(false)
  })
})

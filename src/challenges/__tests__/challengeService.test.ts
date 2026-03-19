import { describe, it, expect } from 'vitest'
import {
  getDailyChallenge,
  getWeeklyChallenge,
  todayString,
  currentWeekString,
} from '../challengeService'

describe('challengeService', () => {
  describe('todayString', () => {
    it('returns a YYYY-MM-DD format string', () => {
      const today = todayString()
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe('currentWeekString', () => {
    it('returns a YYYY-WNN format string', () => {
      const week = currentWeekString()
      expect(week).toMatch(/^\d{4}-W\d{2}$/)
    })
  })

  describe('getDailyChallenge', () => {
    it('returns a challenge with correct type', () => {
      const c = getDailyChallenge('2026-03-19')
      expect(c.type).toBe('daily')
    })

    it('returns a challenge with correct id format', () => {
      const c = getDailyChallenge('2026-03-19')
      expect(c.id).toBe('daily-2026-03-19')
    })

    it('returns same challenge for same date (deterministic)', () => {
      const c1 = getDailyChallenge('2026-03-19')
      const c2 = getDailyChallenge('2026-03-19')
      expect(c1.seed).toBe(c2.seed)
      expect(c1.title).toBe(c2.title)
    })

    it('returns different challenge for different dates', () => {
      const c1 = getDailyChallenge('2026-03-19')
      const c2 = getDailyChallenge('2026-03-20')
      expect(c1.id).not.toBe(c2.id)
      expect(c1.seed).not.toBe(c2.seed)
    })

    it('has a non-empty title and description', () => {
      const c = getDailyChallenge('2026-03-19')
      expect(c.title.length).toBeGreaterThan(0)
      expect(c.description.length).toBeGreaterThan(0)
    })
  })

  describe('getWeeklyChallenge', () => {
    it('returns a challenge with correct type', () => {
      const c = getWeeklyChallenge('2026-W12')
      expect(c.type).toBe('weekly')
    })

    it('returns a challenge with correct id format', () => {
      const c = getWeeklyChallenge('2026-W12')
      expect(c.id).toBe('weekly-2026-W12')
    })

    it('is deterministic for same week', () => {
      const c1 = getWeeklyChallenge('2026-W12')
      const c2 = getWeeklyChallenge('2026-W12')
      expect(c1.seed).toBe(c2.seed)
      expect(c1.title).toBe(c2.title)
    })

    it('differs across weeks', () => {
      const c1 = getWeeklyChallenge('2026-W12')
      const c2 = getWeeklyChallenge('2026-W13')
      expect(c1.id).not.toBe(c2.id)
    })
  })
})

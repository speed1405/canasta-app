import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { GameRecord, PlayerStats } from '../types'
import {
  loadStats,
  saveStats,
  recordGame,
  winRate,
  winRateByDifficulty,
  averageScore,
  longestWinStreak,
  recentGames,
  clearStats,
  createGameRecord,
} from '../stats'

function makeRecord(winner: 'human' | 'ai', score = 1000): GameRecord {
  return createGameRecord('2p', 'easy', winner, { human: score, ai: 0 }, 3, 60000)
}

describe('stats', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('loadStats', () => {
    it('returns default stats when nothing stored', () => {
      const stats = loadStats()
      expect(stats.gamesPlayed).toBe(0)
      expect(stats.wins).toBe(0)
      expect(stats.history).toHaveLength(0)
    })

    it('returns default stats on corrupted data', () => {
      localStorage.setItem('canasta_stats', 'not-json{{{')
      const stats = loadStats()
      expect(stats.gamesPlayed).toBe(0)
    })
  })

  describe('saveStats / loadStats round-trip', () => {
    it('persists data', () => {
      const stats: PlayerStats = {
        gamesPlayed: 5,
        wins: 3,
        losses: 2,
        bestScore: 1234,
        history: [],
      }
      saveStats(stats)
      const loaded = loadStats()
      expect(loaded.gamesPlayed).toBe(5)
      expect(loaded.bestScore).toBe(1234)
    })
  })

  describe('recordGame', () => {
    it('increments gamesPlayed', () => {
      recordGame(makeRecord('human'))
      const stats = loadStats()
      expect(stats.gamesPlayed).toBe(1)
    })

    it('increments wins on human win', () => {
      recordGame(makeRecord('human'))
      expect(loadStats().wins).toBe(1)
    })

    it('increments losses on ai win', () => {
      recordGame(makeRecord('ai'))
      expect(loadStats().losses).toBe(1)
    })

    it('updates bestScore', () => {
      recordGame(makeRecord('human', 2000))
      expect(loadStats().bestScore).toBe(2000)
    })

    it('does not downgrade bestScore', () => {
      recordGame(makeRecord('human', 2000))
      recordGame(makeRecord('human', 500))
      expect(loadStats().bestScore).toBe(2000)
    })

    it('adds record to history', () => {
      recordGame(makeRecord('human'))
      expect(loadStats().history).toHaveLength(1)
    })

    it('caps history at 100', () => {
      for (let i = 0; i < 105; i++) recordGame(makeRecord('human'))
      expect(loadStats().history).toHaveLength(100)
    })
  })

  describe('winRate', () => {
    it('returns 0 when no games', () => {
      expect(winRate(loadStats())).toBe(0)
    })

    it('calculates correct rate', () => {
      recordGame(makeRecord('human'))
      recordGame(makeRecord('ai'))
      expect(winRate(loadStats())).toBe(0.5)
    })
  })

  describe('winRateByDifficulty', () => {
    it('returns 0 for unknown difficulty', () => {
      expect(winRateByDifficulty(loadStats(), 'beginner')).toBe(0)
    })

    it('calculates for matching difficulty', () => {
      recordGame(createGameRecord('2p', 'beginner', 'human', { human: 100 }, 1, 1000))
      recordGame(createGameRecord('2p', 'easy', 'human', { human: 100 }, 1, 1000))
      const stats = loadStats()
      expect(winRateByDifficulty(stats, 'beginner')).toBe(1)
      expect(winRateByDifficulty(stats, 'easy')).toBe(1)
    })
  })

  describe('averageScore', () => {
    it('returns 0 for empty history', () => {
      expect(averageScore(loadStats())).toBe(0)
    })

    it('calculates average human score', () => {
      recordGame(makeRecord('human', 1000))
      recordGame(makeRecord('human', 2000))
      expect(averageScore(loadStats())).toBe(1500)
    })
  })

  describe('longestWinStreak', () => {
    it('returns 0 for no games', () => {
      expect(longestWinStreak(loadStats())).toBe(0)
    })

    it('calculates streak across consecutive wins', () => {
      recordGame(makeRecord('human'))
      recordGame(makeRecord('human'))
      recordGame(makeRecord('ai'))
      recordGame(makeRecord('human'))
      expect(longestWinStreak(loadStats())).toBe(2)
    })
  })

  describe('recentGames', () => {
    it('returns last N games', () => {
      for (let i = 0; i < 25; i++) recordGame(makeRecord('human'))
      expect(recentGames(loadStats(), 20)).toHaveLength(20)
    })
  })

  describe('clearStats', () => {
    it('removes stats from localStorage', () => {
      recordGame(makeRecord('human'))
      clearStats()
      expect(loadStats().gamesPlayed).toBe(0)
    })
  })

  describe('createGameRecord', () => {
    it('generates a record with a unique id', () => {
      const r1 = createGameRecord('2p', 'easy', 'human', {}, 1, 1000)
      const r2 = createGameRecord('2p', 'easy', 'human', {}, 1, 1000)
      expect(r1.id).not.toBe(r2.id)
    })

    it('sets the correct variant and difficulty', () => {
      const r = createGameRecord('3p', 'hard', 'ai', {}, 2, 5000)
      expect(r.variant).toBe('3p')
      expect(r.difficulty).toBe('hard')
    })
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock localStorage
const store: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
})

// Mock firebase to avoid Firestore calls
vi.mock('../../auth/firebase', () => ({ getFirebaseDb: () => null }))

import {
  unlock,
  isUnlocked,
  getUnlocked,
  onAchievementUnlock,
  checkGameEndAchievements,
  checkPilePickupAchievements,
} from '../achievementService'

beforeEach(() => {
  store['canasta_achievements'] = JSON.stringify({ unlocked: [] })
})

describe('achievementService', () => {
  it('unlock stores achievement locally', async () => {
    await unlock('first_win')
    expect(isUnlocked('first_win')).toBe(true)
  })

  it('unlock is idempotent', async () => {
    await unlock('first_win')
    await unlock('first_win')
    const unlocked = getUnlocked()
    const count = unlocked.filter((u) => u.achievementId === 'first_win').length
    expect(count).toBe(1)
  })

  it('does nothing for unknown achievement id', async () => {
    await unlock('fake_achievement_xyz')
    expect(isUnlocked('fake_achievement_xyz')).toBe(false)
  })

  it('fires onAchievementUnlock callback when unlocked', async () => {
    const cb = vi.fn()
    const unsub = onAchievementUnlock(cb)
    await unlock('first_canasta')
    expect(cb).toHaveBeenCalledWith('first_canasta')
    unsub()
  })

  it('does not fire callback for already-unlocked achievement', async () => {
    await unlock('first_canasta') // first unlock
    const cb = vi.fn()
    const unsub = onAchievementUnlock(cb)
    await unlock('first_canasta') // second unlock — should be no-op
    expect(cb).not.toHaveBeenCalled()
    unsub()
  })

  it('getUnlocked returns all unlocked achievements', async () => {
    await unlock('first_win')
    await unlock('first_canasta')
    const unlocked = getUnlocked()
    expect(unlocked.map((u) => u.achievementId)).toContain('first_win')
    expect(unlocked.map((u) => u.achievementId)).toContain('first_canasta')
  })

  describe('checkGameEndAchievements', () => {
    it('unlocks first_win when player wins', async () => {
      await checkGameEndAchievements({
        won: true,
        difficulty: 'easy',
        variant: '2p',
        usedHints: false,
        canastaCount: 0,
        naturalCanastaCount: 0,
        totalScore: 100,
        roundScore: 100,
        isGoingOutConcealed: false,
        wildCardsInMelds: 0,
      })
      expect(isUnlocked('first_win')).toBe(true)
    })

    it('unlocks win_without_hints when no hints used', async () => {
      await checkGameEndAchievements({
        won: true,
        difficulty: 'easy',
        variant: '2p',
        usedHints: false,
        canastaCount: 0,
        naturalCanastaCount: 0,
        totalScore: 100,
        roundScore: 100,
        isGoingOutConcealed: false,
        wildCardsInMelds: 0,
      })
      expect(isUnlocked('win_without_hints')).toBe(true)
    })

    it('does not unlock win_without_hints when hints were used', async () => {
      await checkGameEndAchievements({
        won: true,
        difficulty: 'easy',
        variant: '2p',
        usedHints: true,
        canastaCount: 0,
        naturalCanastaCount: 0,
        totalScore: 100,
        roundScore: 100,
        isGoingOutConcealed: false,
        wildCardsInMelds: 0,
      })
      expect(isUnlocked('win_without_hints')).toBe(false)
    })

    it('unlocks beat_expert_ai for expert difficulty win', async () => {
      await checkGameEndAchievements({
        won: true,
        difficulty: 'expert',
        variant: '2p',
        usedHints: false,
        canastaCount: 0,
        naturalCanastaCount: 0,
        totalScore: 100,
        roundScore: 100,
        isGoingOutConcealed: false,
        wildCardsInMelds: 0,
      })
      expect(isUnlocked('beat_expert_ai')).toBe(true)
    })

    it('unlocks first_canasta when canastaCount >= 1', async () => {
      await checkGameEndAchievements({
        won: false,
        difficulty: 'easy',
        variant: '2p',
        usedHints: false,
        canastaCount: 1,
        naturalCanastaCount: 0,
        totalScore: 0,
        roundScore: 0,
        isGoingOutConcealed: false,
        wildCardsInMelds: 0,
      })
      expect(isUnlocked('first_canasta')).toBe(true)
    })

    it('unlocks concealed_go_out when going out concealed', async () => {
      await checkGameEndAchievements({
        won: false,
        difficulty: 'easy',
        variant: '2p',
        usedHints: false,
        canastaCount: 0,
        naturalCanastaCount: 0,
        totalScore: 0,
        roundScore: 0,
        isGoingOutConcealed: true,
        wildCardsInMelds: 0,
      })
      expect(isUnlocked('concealed_go_out')).toBe(true)
    })
  })

  describe('checkPilePickupAchievements', () => {
    it('unlocks first_pile_pickup on any pile pickup', async () => {
      await checkPilePickupAchievements(3)
      expect(isUnlocked('first_pile_pickup')).toBe(true)
    })

    it('unlocks large_pile_pickup for pile of 10+', async () => {
      await checkPilePickupAchievements(10)
      expect(isUnlocked('large_pile_pickup')).toBe(true)
    })

    it('does not unlock large_pile_pickup for small pile', async () => {
      await checkPilePickupAchievements(5)
      expect(isUnlocked('large_pile_pickup')).toBe(false)
    })
  })
})

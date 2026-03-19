import { describe, it, expect } from 'vitest'
import { ACHIEVEMENTS, getAchievementById } from '../achievements'

describe('ACHIEVEMENTS', () => {
  it('has at least 30 achievements', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(30)
  })

  it('every achievement has required fields', () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.id).toBeTruthy()
      expect(a.title).toBeTruthy()
      expect(a.description).toBeTruthy()
      expect(a.icon).toBeTruthy()
      expect(['milestone', 'skill', 'social']).toContain(a.category)
    }
  })

  it('all ids are unique', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('getAchievementById returns the correct achievement', () => {
    const a = getAchievementById('first_win')
    expect(a).toBeDefined()
    expect(a?.title).toBe('First Victory')
  })

  it('getAchievementById returns undefined for unknown id', () => {
    expect(getAchievementById('nonexistent_id')).toBeUndefined()
  })

  it('covers milestone category', () => {
    const milestones = ACHIEVEMENTS.filter((a) => a.category === 'milestone')
    expect(milestones.length).toBeGreaterThan(0)
  })

  it('covers skill category', () => {
    const skill = ACHIEVEMENTS.filter((a) => a.category === 'skill')
    expect(skill.length).toBeGreaterThan(0)
  })

  it('covers social category', () => {
    const social = ACHIEVEMENTS.filter((a) => a.category === 'social')
    expect(social.length).toBeGreaterThan(0)
  })
})

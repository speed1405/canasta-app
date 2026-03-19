/** Types for the Achievements system. */

export type AchievementCategory = 'milestone' | 'skill' | 'social'

export interface AchievementDefinition {
  id: string
  title: string
  description: string
  icon: string
  category: AchievementCategory
}

export interface AchievementUnlock {
  achievementId: string
  unlockedAt: number
}

export interface AchievementState {
  unlocked: AchievementUnlock[]
}

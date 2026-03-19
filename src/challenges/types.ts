/** Types for Daily & Weekly Challenges. */

export type ChallengeType = 'daily' | 'weekly'

export interface Challenge {
  id: string
  type: ChallengeType
  /** ISO date string representing the day this challenge is for (YYYY-MM-DD). */
  date: string
  /** Seed string used to reproducibly generate the hand. */
  seed: string
  title: string
  description: string
}

export interface ChallengeEntry {
  /** Player display name. */
  displayName: string
  /** UID or anonymous key. */
  uid: string
  /** Final score the player achieved. */
  score: number
  /** Unix timestamp when the entry was submitted. */
  submittedAt: number
}

export interface ChallengeLeaderboard {
  challengeId: string
  entries: ChallengeEntry[]
}

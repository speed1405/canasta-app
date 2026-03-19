/**
 * Daily & Weekly Challenge service.
 *
 * Challenges are seeded from the current date so every player plays the same
 * scenario on the same day.  Scores are stored in Firestore when configured.
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore'
import { getFirebaseDb } from '../auth/firebase'
import type { Challenge, ChallengeEntry, ChallengeLeaderboard } from './types'

const LEADERBOARD_COL = 'challengeLeaderboards'

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Returns today's date as YYYY-MM-DD. */
export function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Returns the ISO week number for a date. */
function isoWeekNumber(date: Date): number {
  const tmp = new Date(date.valueOf())
  tmp.setDate(tmp.getDate() + 4 - (tmp.getDay() || 7))
  const yearStart = new Date(tmp.getFullYear(), 0, 1)
  return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/** Returns the ISO week string for the current week as YYYY-WNN. */
export function currentWeekString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const week = isoWeekNumber(now)
  return `${year}-W${String(week).padStart(2, '0')}`
}

// ─── Challenge generation ─────────────────────────────────────────────────────

const DAILY_TITLES = [
  'Morning Hand',
  'Afternoon Hustle',
  'Evening Session',
  'Sunset Challenge',
  'Dawn Draw',
]

const WEEKLY_TITLES = [
  'Weekly Marathon',
  'Strategy of the Week',
  'Weekly Playoff',
  'Weekend Showdown',
  'Week\'s Best Hand',
]

/** Generate a deterministic daily challenge for the given date string (YYYY-MM-DD). */
export function getDailyChallenge(date: string = todayString()): Challenge {
  // Simple numeric hash from the date string
  let hash = 0
  for (let i = 0; i < date.length; i++) {
    hash = (hash * 31 + date.charCodeAt(i)) >>> 0
  }

  const titleIdx = hash % DAILY_TITLES.length
  return {
    id: `daily-${date}`,
    type: 'daily',
    date,
    seed: `daily-${date}`,
    title: DAILY_TITLES[titleIdx],
    description: `Play today's seeded hand — every player gets the same cards. Post your highest score!`,
  }
}

/** Generate a deterministic weekly challenge for the given week string (YYYY-WNN). */
export function getWeeklyChallenge(week: string = currentWeekString()): Challenge {
  let hash = 0
  for (let i = 0; i < week.length; i++) {
    hash = (hash * 31 + week.charCodeAt(i)) >>> 0
  }

  const titleIdx = hash % WEEKLY_TITLES.length
  return {
    id: `weekly-${week}`,
    type: 'weekly',
    date: week,
    seed: `weekly-${week}`,
    title: WEEKLY_TITLES[titleIdx],
    description: `This week's strategy challenge — compete for the highest score with the same seeded deal as everyone else.`,
  }
}

// ─── Leaderboard persistence ──────────────────────────────────────────────────

/** Submit a score for a challenge. */
export async function submitChallengeScore(
  challengeId: string,
  entry: ChallengeEntry,
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  const docId = `${challengeId}_${entry.uid}`
  await setDoc(
    doc(collection(db, LEADERBOARD_COL), docId),
    { challengeId, ...entry },
    { merge: true },
  )
}

/** Fetch the leaderboard for a challenge (top 50 scores). */
export async function getChallengeLeaderboard(
  challengeId: string,
): Promise<ChallengeLeaderboard> {
  const db = getFirebaseDb()
  if (!db) return { challengeId, entries: [] }

  const snap = await getDocs(
    query(
      collection(db, LEADERBOARD_COL),
      where('challengeId', '==', challengeId),
      orderBy('score', 'desc'),
      limit(50),
    ),
  )

  const entries: ChallengeEntry[] = snap.docs.map((d) => {
    const data = d.data()
    return {
      displayName: data.displayName as string,
      uid: data.uid as string,
      score: data.score as number,
      submittedAt: data.submittedAt as number,
    }
  })

  return { challengeId, entries }
}

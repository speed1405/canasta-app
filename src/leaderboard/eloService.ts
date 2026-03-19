/**
 * Elo rating system for Canasta matches.
 *
 * Each player starts at DEFAULT_ELO (1200).  After every completed match the
 * winner gains points and the loser loses the same number of points, with the
 * amount scaled by the expected outcome (higher-rated player gains/loses less).
 *
 * Firestore schema:
 *   Collection: "leaderboard"
 *     Document ID: <uid>
 *     Fields: uid, displayName, elo, wins, losses, variant (optional)
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  limit,
  where,
} from 'firebase/firestore'
import { getFirebaseDb } from '../auth/firebase'
import type { Variant } from '../game/types'

export const DEFAULT_ELO = 1200
const K_FACTOR = 32 // standard K-factor for new/casual players

const LEADERBOARD_COL = 'leaderboard'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  uid: string
  displayName: string
  elo: number
  wins: number
  losses: number
  /** If set, this entry is for a specific variant leaderboard */
  variant?: Variant
}

// ─── Elo Math ─────────────────────────────────────────────────────────────────

/** Expected score for `ratingA` when playing against `ratingB`. */
export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

/**
 * Returns new [ratingA, ratingB] after a match where playerA scored `scoreA`
 * (1 = win, 0 = loss, 0.5 = draw).
 */
export function updateElo(
  ratingA: number,
  ratingB: number,
  scoreA: number,
): [number, number] {
  const ea = expectedScore(ratingA, ratingB)
  const eb = expectedScore(ratingB, ratingA)
  const scoreB = 1 - scoreA
  return [
    Math.round(ratingA + K_FACTOR * (scoreA - ea)),
    Math.round(ratingB + K_FACTOR * (scoreB - eb)),
  ]
}

// ─── Firebase CRUD ────────────────────────────────────────────────────────────

/** Fetch or create a leaderboard entry for a user. */
export async function getOrCreateEntry(uid: string, displayName: string): Promise<LeaderboardEntry> {
  const db = getFirebaseDb()
  if (!db) return { uid, displayName, elo: DEFAULT_ELO, wins: 0, losses: 0 }

  const ref = doc(db, LEADERBOARD_COL, uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return snap.data() as LeaderboardEntry

  const entry: LeaderboardEntry = { uid, displayName, elo: DEFAULT_ELO, wins: 0, losses: 0 }
  await setDoc(ref, entry)
  return entry
}

/**
 * Record a completed match and update Elo ratings.
 *
 * @param winnerUid  UID of the match winner
 * @param loserUid   UID of the match loser
 * @param winnerName Display name of winner
 * @param loserName  Display name of loser
 */
export async function recordMatchResult(
  winnerUid: string,
  loserUid: string,
  winnerName: string,
  loserName: string,
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  const [winner, loser] = await Promise.all([
    getOrCreateEntry(winnerUid, winnerName),
    getOrCreateEntry(loserUid, loserName),
  ])

  const [newWinnerElo, newLoserElo] = updateElo(winner.elo, loser.elo, 1)

  await Promise.all([
    updateDoc(doc(db, LEADERBOARD_COL, winnerUid), {
      elo: newWinnerElo,
      wins: winner.wins + 1,
      displayName: winnerName,
    }),
    updateDoc(doc(db, LEADERBOARD_COL, loserUid), {
      elo: newLoserElo,
      losses: loser.losses + 1,
      displayName: loserName,
    }),
  ])
}

/** Fetch the top `n` entries from the global leaderboard sorted by Elo. */
export async function getTopEntries(n = 50): Promise<LeaderboardEntry[]> {
  const db = getFirebaseDb()
  if (!db) return []

  const q = query(
    collection(db, LEADERBOARD_COL),
    orderBy('elo', 'desc'),
    limit(n),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as LeaderboardEntry)
}

/** Fetch a single user's leaderboard entry. */
export async function getUserEntry(uid: string): Promise<LeaderboardEntry | null> {
  const db = getFirebaseDb()
  if (!db) return null

  const snap = await getDoc(doc(db, LEADERBOARD_COL, uid))
  return snap.exists() ? (snap.data() as LeaderboardEntry) : null
}

/** Fetch top entries filtered to a specific game variant. */
export async function getVariantLeaderboard(variant: Variant, n = 50): Promise<LeaderboardEntry[]> {
  const db = getFirebaseDb()
  if (!db) return []

  const col = `leaderboard_${variant}`
  const q = query(
    collection(db, col),
    orderBy('elo', 'desc'),
    limit(n),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as LeaderboardEntry)
}

/** Update (or create) a variant-specific leaderboard entry. */
export async function recordVariantMatchResult(
  winnerUid: string,
  loserUid: string,
  winnerName: string,
  loserName: string,
  variant: Variant,
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  const col = `leaderboard_${variant}`
  const winnerRef = doc(db, col, winnerUid)
  const loserRef = doc(db, col, loserUid)

  const [wSnap, lSnap] = await Promise.all([getDoc(winnerRef), getDoc(loserRef)])
  const winner: LeaderboardEntry = wSnap.exists()
    ? (wSnap.data() as LeaderboardEntry)
    : { uid: winnerUid, displayName: winnerName, elo: DEFAULT_ELO, wins: 0, losses: 0, variant }
  const loser: LeaderboardEntry = lSnap.exists()
    ? (lSnap.data() as LeaderboardEntry)
    : { uid: loserUid, displayName: loserName, elo: DEFAULT_ELO, wins: 0, losses: 0, variant }

  const [newWinnerElo, newLoserElo] = updateElo(winner.elo, loser.elo, 1)

  await Promise.all([
    setDoc(winnerRef, { ...winner, elo: newWinnerElo, wins: winner.wins + 1, displayName: winnerName }),
    setDoc(loserRef, { ...loser, elo: newLoserElo, losses: loser.losses + 1, displayName: loserName }),
  ])
}

/** Fetch leaderboard entries for a list of friend UIDs. */
export async function getFriendsLeaderboard(friendUids: string[]): Promise<LeaderboardEntry[]> {
  const db = getFirebaseDb()
  if (!db || friendUids.length === 0) return []

  const batchSize = 10
  const results: LeaderboardEntry[] = []
  for (let i = 0; i < friendUids.length; i += batchSize) {
    const batch = friendUids.slice(i, i + batchSize)
    const q = query(collection(db, LEADERBOARD_COL), where('uid', 'in', batch))
    const snap = await getDocs(q)
    snap.docs.forEach(d => results.push(d.data() as LeaderboardEntry))
  }
  results.sort((a, b) => b.elo - a.elo)
  return results
}

/**
 * cloudSync.ts — abstraction layer that reads/writes user data to Firestore
 * when a user is signed in, and falls back to localStorage for guests.
 *
 * Collections layout (all scoped under `users/{uid}/`):
 *   users/{uid}/data/stats        — PlayerStats document
 *   users/{uid}/data/lessons      — { completed: string[] }
 *   users/{uid}/data/practice     — { results: Record<string, ScenarioResult> }
 *   users/{uid}/data/preferences  — Preferences document
 */

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore'
import type { User } from 'firebase/auth'
import { getFirebaseDb } from './firebase'
import type { PlayerStats } from '../game/types'
import type { ScenarioResult } from '../game/practiceProgress'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function userDataRef(uid: string, docId: string) {
  const db = getFirebaseDb()
  if (!db) return null
  return doc(db, 'users', uid, 'data', docId)
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function loadCloudStats(user: User): Promise<PlayerStats | null> {
  const ref = userDataRef(user.uid, 'stats')
  if (!ref) return null
  try {
    const snap = await getDoc(ref)
    if (snap.exists()) return snap.data() as PlayerStats
  } catch { /* network error — fall through */ }
  return null
}

export async function saveCloudStats(user: User, stats: PlayerStats): Promise<void> {
  const ref = userDataRef(user.uid, 'stats')
  if (!ref) return
  try {
    await setDoc(ref, stats)
  } catch { /* ignore — will sync on next save */ }
}

// ─── Lesson progress ─────────────────────────────────────────────────────────

export async function loadCloudLessons(user: User): Promise<Set<string>> {
  const ref = userDataRef(user.uid, 'lessons')
  if (!ref) return new Set()
  try {
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const data = snap.data() as { completed?: string[] }
      if (Array.isArray(data.completed)) return new Set(data.completed)
    }
  } catch { /* fall through */ }
  return new Set()
}

export async function saveCloudLessons(user: User, completed: Set<string>): Promise<void> {
  const ref = userDataRef(user.uid, 'lessons')
  if (!ref) return
  try {
    await setDoc(ref, { completed: [...completed] })
  } catch { /* ignore */ }
}

// ─── Practice progress ────────────────────────────────────────────────────────

export async function loadCloudPractice(
  user: User,
): Promise<Record<string, ScenarioResult>> {
  const ref = userDataRef(user.uid, 'practice')
  if (!ref) return {}
  try {
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const data = snap.data() as { results?: Record<string, ScenarioResult> }
      if (data.results) return data.results
    }
  } catch { /* fall through */ }
  return {}
}

export async function saveCloudPractice(
  user: User,
  results: Record<string, ScenarioResult>,
): Promise<void> {
  const ref = userDataRef(user.uid, 'practice')
  if (!ref) return
  try {
    await setDoc(ref, { results })
  } catch { /* ignore */ }
}

// ─── Preferences ─────────────────────────────────────────────────────────────

export async function loadCloudPreferences(user: User): Promise<Record<string, unknown> | null> {
  const ref = userDataRef(user.uid, 'preferences')
  if (!ref) return null
  try {
    const snap = await getDoc(ref)
    if (snap.exists()) return snap.data() as Record<string, unknown>
  } catch { /* fall through */ }
  return null
}

export async function saveCloudPreferences(
  user: User,
  prefs: Record<string, unknown>,
): Promise<void> {
  const ref = userDataRef(user.uid, 'preferences')
  if (!ref) return
  try {
    await setDoc(ref, prefs)
  } catch { /* ignore */ }
}

// ─── Merge guest data into cloud on first sign-in ────────────────────────────

/**
 * Uploads local localStorage data to the cloud, merging with any existing
 * cloud records.  Existing cloud data takes precedence for scalar counters;
 * history arrays are concatenated and de-duplicated by `id`.
 */
export async function mergeGuestDataToCloud(user: User): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  // ── Stats merge ────────────────────────────────────────────────────────────
  try {
    const STATS_KEY = 'canasta_stats'
    const localRaw = localStorage.getItem(STATS_KEY)
    if (localRaw) {
      const local = JSON.parse(localRaw) as PlayerStats
      const cloudStats = await loadCloudStats(user)
      if (cloudStats) {
        // Merge: combine history, re-derive counters
        const seenIds = new Set(cloudStats.history.map((r) => r.id))
        const newEntries = (local.history ?? []).filter((r) => !seenIds.has(r.id))
        cloudStats.history = [...cloudStats.history, ...newEntries].slice(0, 100)
        cloudStats.gamesPlayed = cloudStats.history.length
        cloudStats.wins = cloudStats.history.filter((r) => r.winner === 'human').length
        cloudStats.losses = cloudStats.history.filter((r) => r.winner !== 'human').length
        cloudStats.bestScore = Math.max(
          cloudStats.bestScore,
          ...cloudStats.history.map((r) => r.scores['human'] ?? 0),
        )
        await saveCloudStats(user, cloudStats)
      } else {
        await saveCloudStats(user, local)
      }
    }
  } catch { /* ignore merge errors */ }

  // ── Lessons merge ──────────────────────────────────────────────────────────
  try {
    const LESSONS_KEY = 'canasta_lessons_completed'
    const localRaw = localStorage.getItem(LESSONS_KEY)
    if (localRaw) {
      const localSet = new Set<string>(JSON.parse(localRaw) as string[])
      const cloudSet = await loadCloudLessons(user)
      const merged = new Set([...cloudSet, ...localSet])
      await saveCloudLessons(user, merged)
    }
  } catch { /* ignore */ }

  // ── Practice merge ─────────────────────────────────────────────────────────
  try {
    const PRACTICE_KEY = 'canasta_practice_results'
    const localRaw = localStorage.getItem(PRACTICE_KEY)
    if (localRaw) {
      const local = JSON.parse(localRaw) as Record<string, ScenarioResult>
      const cloud = await loadCloudPractice(user)
      // Merge: for each scenario, take the more-favourable result
      const merged: Record<string, ScenarioResult> = { ...local }
      for (const [id, cloudResult] of Object.entries(cloud)) {
        const localResult = merged[id]
        if (!localResult) {
          merged[id] = cloudResult
        } else {
          merged[id] = {
            passed: localResult.passed || cloudResult.passed,
            attempts: Math.max(localResult.attempts, cloudResult.attempts),
          }
        }
      }
      await saveCloudPractice(user, merged)
    }
  } catch { /* ignore */ }

  // ── Preferences merge ──────────────────────────────────────────────────────
  try {
    const PREFS_KEY = 'canasta_prefs'
    const localRaw = localStorage.getItem(PREFS_KEY)
    if (localRaw) {
      const localPrefs = JSON.parse(localRaw) as Record<string, unknown>
      // Only upload local prefs if the cloud has none yet
      const cloudPrefs = await loadCloudPreferences(user)
      if (!cloudPrefs) {
        await saveCloudPreferences(user, localPrefs)
      }
    }
  } catch { /* ignore */ }
}

// ─── Delete all cloud data for a user ────────────────────────────────────────

export async function deleteAllCloudData(user: User): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return
  try {
    const dataCollection = collection(db, 'users', user.uid, 'data')
    const snap = await getDocs(dataCollection)
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
  } catch { /* ignore */ }
}

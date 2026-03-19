/**
 * Achievement service.
 *
 * Stores unlocked achievements in localStorage (key: canasta_achievements)
 * and optionally syncs to Firestore when Firebase is configured.
 *
 * Design principles:
 * - Unlock is idempotent — calling unlock() twice does nothing the second time.
 * - The service exposes a callback so UI layers can show toast notifications.
 */

import { getFirebaseDb } from '../auth/firebase'
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import type { AchievementUnlock, AchievementState } from './types'
import { ACHIEVEMENTS, getAchievementById } from './achievements'

export { ACHIEVEMENTS, getAchievementById }

const LOCAL_KEY = 'canasta_achievements'
const CLOUD_COL = 'achievements'

// ─── Local persistence ────────────────────────────────────────────────────────

function loadLocal(): AchievementState {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (raw) return JSON.parse(raw) as AchievementState
  } catch { /* ignore */ }
  return { unlocked: [] }
}

function saveLocal(state: AchievementState): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

// ─── Unlock callback registry ────────────────────────────────────────────────

type UnlockCallback = (achievementId: string) => void
const _listeners: UnlockCallback[] = []

/** Register a callback fired when a new achievement is unlocked. */
export function onAchievementUnlock(cb: UnlockCallback): () => void {
  _listeners.push(cb)
  return () => {
    const idx = _listeners.indexOf(cb)
    if (idx !== -1) _listeners.splice(idx, 1)
  }
}

function _notify(id: string) {
  for (const cb of _listeners) cb(id)
}

// ─── Core API ─────────────────────────────────────────────────────────────────

/** Returns all currently unlocked achievements. */
export function getUnlocked(): AchievementUnlock[] {
  return loadLocal().unlocked
}

/** Returns true if the achievement with this ID has already been unlocked. */
export function isUnlocked(id: string): boolean {
  return loadLocal().unlocked.some((u) => u.achievementId === id)
}

/**
 * Unlock an achievement. Does nothing if already unlocked.
 * Fires registered callbacks with the achievement ID.
 * Optionally persists to Firestore when `uid` is provided.
 */
export async function unlock(id: string, uid?: string | null): Promise<void> {
  // Validate the achievement exists
  if (!getAchievementById(id)) return

  const state = loadLocal()
  if (state.unlocked.some((u) => u.achievementId === id)) return // already unlocked

  const entry: AchievementUnlock = { achievementId: id, unlockedAt: Date.now() }
  state.unlocked.push(entry)
  saveLocal(state)
  _notify(id)

  // Cloud sync
  if (uid) {
    const db = getFirebaseDb()
    if (db) {
      try {
        await setDoc(
          doc(collection(db, CLOUD_COL), `${uid}_${id}`),
          { uid, ...entry },
        )
      } catch { /* ignore — local copy is already saved */ }
    }
  }
}

/** Load achievements from the cloud and merge with local state. */
export async function syncFromCloud(uid: string): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  try {
    const snap = await getDocs(
      query(collection(db, CLOUD_COL), where('uid', '==', uid)),
    )
    const state = loadLocal()
    const existing = new Set(state.unlocked.map((u) => u.achievementId))
    for (const d of snap.docs) {
      const entry = d.data() as { achievementId: string; unlockedAt: number }
      if (!existing.has(entry.achievementId)) {
        state.unlocked.push({ achievementId: entry.achievementId, unlockedAt: entry.unlockedAt })
        existing.add(entry.achievementId)
      }
    }
    saveLocal(state)
  } catch { /* ignore */ }
}

// ─── Game-event helpers ───────────────────────────────────────────────────────
// These are called from the game store / engine after significant events.

/** Call after a game ends to check and unlock relevant achievements. */
export async function checkGameEndAchievements(opts: {
  won: boolean
  difficulty: string
  variant: string
  usedHints: boolean
  canastaCount: number
  naturalCanastaCount: number
  totalScore: number
  roundScore: number
  isGoingOutConcealed: boolean
  wildCardsInMelds: number
  uid?: string | null
}): Promise<void> {
  const {
    won,
    difficulty,
    variant,
    usedHints,
    canastaCount,
    naturalCanastaCount,
    totalScore,
    roundScore,
    isGoingOutConcealed,
    wildCardsInMelds,
    uid,
  } = opts

  if (won) {
    await unlock('first_win', uid)
    if (!usedHints) await unlock('win_without_hints', uid)
    if (difficulty === 'expert') await unlock('beat_expert_ai', uid)
    if (difficulty === 'neural') await unlock('beat_neural_ai', uid)
    if (variant === '3p') await unlock('win_3p_game', uid)
    if (variant === '4p-partnership') await unlock('win_partnership_game', uid)
    if (wildCardsInMelds === 0) await unlock('win_no_wilds_melded', uid)
  }
  if (canastaCount >= 1) await unlock('first_canasta', uid)
  if (naturalCanastaCount >= 1) await unlock('first_natural_canasta', uid)
  if (canastaCount >= 3) await unlock('three_canastas_one_round', uid)
  if (naturalCanastaCount >= 3) await unlock('three_naturals', uid)
  if (isGoingOutConcealed) await unlock('concealed_go_out', uid)
  if (totalScore >= 5000) await unlock('score_5000', uid)
  if (roundScore >= 500) await unlock('score_500_round', uid)
}

/** Call after pile pickup. */
export async function checkPilePickupAchievements(
  pileSize: number,
  uid?: string | null,
): Promise<void> {
  await unlock('first_pile_pickup', uid)
  if (pileSize >= 10) await unlock('large_pile_pickup', uid)
}

/** Call when the user completes all lessons. */
export async function checkLessonAchievements(
  completedCount: number,
  totalCount: number,
  uid?: string | null,
): Promise<void> {
  if (completedCount >= totalCount) await unlock('complete_all_lessons', uid)
}

/** Call when the user completes all practice drills. */
export async function checkPracticeAchievements(
  passedCount: number,
  totalCount: number,
  uid?: string | null,
): Promise<void> {
  if (passedCount >= totalCount) await unlock('complete_all_practice', uid)
}

/** Call when a friend is added. */
export async function checkFriendAchievements(
  friendCount: number,
  uid?: string | null,
): Promise<void> {
  if (friendCount >= 1) await unlock('first_friend', uid)
  if (friendCount >= 3) await unlock('three_friends', uid)
}

/** Call when a game stat crosses a threshold. */
export async function checkPlayCountAchievements(
  gamesPlayed: number,
  gamesWon: number,
  uid?: string | null,
): Promise<void> {
  if (gamesPlayed >= 10) await unlock('play_10_games', uid)
  if (gamesPlayed >= 50) await unlock('play_50_games', uid)
  if (gamesWon >= 10) await unlock('ten_wins', uid)
  if (gamesWon >= 50) await unlock('fifty_wins', uid)
  if (gamesWon >= 100) await unlock('hundred_wins', uid)
}

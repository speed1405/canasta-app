/**
 * Game Replay service.
 *
 * Replays are stored in Firestore (collection: 'gameReplays') when Firebase is
 * configured; otherwise the service operates in no-op / mock mode.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore'
import { getFirebaseDb } from '../auth/firebase'
import type { GameReplay, ReplayAction } from './types'

const REPLAYS_COL = 'gameReplays'

// ─── Save / update ────────────────────────────────────────────────────────────

/** Save a completed game replay to the cloud. Returns the replay ID. */
export async function saveReplay(replay: GameReplay): Promise<string> {
  const db = getFirebaseDb()
  if (!db) return replay.id

  await setDoc(doc(collection(db, REPLAYS_COL), replay.id), replay)
  return replay.id
}

/** Append a single action to an existing replay document. */
export async function appendReplayAction(
  replayId: string,
  action: ReplayAction,
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return

  // Firestore doesn't support array-append of objects in a typed way via
  // updateDoc with arrayUnion for nested objects reliably, so we fetch & update.
  const ref = doc(collection(db, REPLAYS_COL), replayId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const replay = snap.data() as GameReplay
  const updatedActions = [...(replay.actions ?? []), action]
  await updateDoc(ref, { actions: updatedActions, updatedAt: Date.now() })
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

/** Load a single replay by ID. */
export async function getReplay(id: string): Promise<GameReplay | null> {
  const db = getFirebaseDb()
  if (!db) return null

  const snap = await getDoc(doc(collection(db, REPLAYS_COL), id))
  if (!snap.exists()) return null
  return snap.data() as GameReplay
}

/** Fetch the most-recent replays for a user (up to `n`). */
export async function getUserReplays(
  uid: string,
  n = 20,
): Promise<GameReplay[]> {
  const db = getFirebaseDb()
  if (!db) return []

  const snap = await getDocs(
    query(
      collection(db, REPLAYS_COL),
      where('ownerUid', '==', uid),
      orderBy('playedAt', 'desc'),
      limit(n),
    ),
  )
  return snap.docs.map((d) => d.data() as GameReplay)
}

/** Fetch recent public replays (for a community feed). */
export async function getPublicReplays(n = 20): Promise<GameReplay[]> {
  const db = getFirebaseDb()
  if (!db) return []

  const snap = await getDocs(
    query(
      collection(db, REPLAYS_COL),
      where('isPublic', '==', true),
      orderBy('playedAt', 'desc'),
      limit(n),
    ),
  )
  return snap.docs.map((d) => d.data() as GameReplay)
}

// ─── Visibility ───────────────────────────────────────────────────────────────

/** Toggle the public / private visibility of a replay. */
export async function setReplayVisibility(
  replayId: string,
  isPublic: boolean,
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return
  await updateDoc(doc(collection(db, REPLAYS_COL), replayId), { isPublic })
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/** Create a new (empty) GameReplay object ready to have actions appended. */
export function createReplay(opts: {
  ownerUid: string | null
  playerNames: string[]
  variant: string
}): GameReplay {
  return {
    id: crypto.randomUUID(),
    ownerUid: opts.ownerUid,
    playerNames: opts.playerNames,
    variant: opts.variant,
    actions: [],
    finalState: null,
    playedAt: Date.now(),
    isPublic: false,
  }
}

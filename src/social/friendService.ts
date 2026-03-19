/**
 * Friends / Social service.
 *
 * Uses Firestore when Firebase is configured; operates in no-op mode
 * (returns empty data) when running without Firebase credentials so the app
 * still compiles and renders gracefully in CI / preview environments.
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirebaseDb } from '../auth/firebase'
import type { FriendRequest, Friend, OnlineStatus } from './types'

const REQUESTS_COL = 'friendRequests'
const PROFILES_COL = 'userProfiles'

// ─── Public profile upsert ────────────────────────────────────────────────────

/** Write / update the public profile so friends can look you up by UID. */
export async function upsertPublicProfile(
  uid: string,
  displayName: string,
  status: OnlineStatus = 'online',
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return
  await setDoc(
    doc(collection(db, PROFILES_COL), uid),
    { uid, displayName, status, lastSeen: Date.now() },
    { merge: true },
  )
}

// ─── Friend requests ──────────────────────────────────────────────────────────

/** Send a friend request from `fromUid` to `toUid`. */
export async function sendFriendRequest(
  fromUid: string,
  fromDisplayName: string,
  toUid: string,
  toDisplayName: string,
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firestore not configured')

  const id = crypto.randomUUID()
  const request: FriendRequest = {
    id,
    fromUid,
    fromDisplayName,
    toUid,
    toDisplayName,
    status: 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  await setDoc(doc(collection(db, REQUESTS_COL), id), request)
}

/** Accept or decline an incoming friend request. */
export async function respondToFriendRequest(
  requestId: string,
  accept: boolean,
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firestore not configured')

  await updateDoc(doc(collection(db, REQUESTS_COL), requestId), {
    status: accept ? 'accepted' : 'declined',
    updatedAt: Date.now(),
  })
}

// ─── Friends list ─────────────────────────────────────────────────────────────

/** Fetch the list of accepted friends for a user. */
export async function getFriends(uid: string): Promise<Friend[]> {
  const db = getFirebaseDb()
  if (!db) return []

  // Accepted requests where user is either sender or receiver
  const [sentSnap, receivedSnap] = await Promise.all([
    getDocs(
      query(
        collection(db, REQUESTS_COL),
        where('fromUid', '==', uid),
        where('status', '==', 'accepted'),
      ),
    ),
    getDocs(
      query(
        collection(db, REQUESTS_COL),
        where('toUid', '==', uid),
        where('status', '==', 'accepted'),
      ),
    ),
  ])

  const friendUids = new Set<string>()
  const friendMeta: Record<string, { displayName: string }> = {}

  for (const d of sentSnap.docs) {
    const r = d.data() as FriendRequest
    friendUids.add(r.toUid)
    friendMeta[r.toUid] = { displayName: r.toDisplayName }
  }
  for (const d of receivedSnap.docs) {
    const r = d.data() as FriendRequest
    friendUids.add(r.fromUid)
    friendMeta[r.fromUid] = { displayName: r.fromDisplayName }
  }

  // Batch-fetch live status from user profiles using 'in' operator.
  // Firestore 'in' supports up to 30 items; split into chunks for safety.
  const friendUidArray = Array.from(friendUids)
  const profilesByUid: Record<string, { displayName?: string; status?: string; lastSeen?: number }> = {}

  const BATCH_SIZE = 30
  for (let i = 0; i < friendUidArray.length; i += BATCH_SIZE) {
    const chunk = friendUidArray.slice(i, i + BATCH_SIZE)
    const profileSnap = await getDocs(
      query(collection(db, PROFILES_COL), where('uid', 'in', chunk)),
    )
    for (const d of profileSnap.docs) {
      const data = d.data() as { uid: string; displayName?: string; status?: string; lastSeen?: number }
      profilesByUid[data.uid] = data
    }
  }

  const friends: Friend[] = friendUidArray.map((fUid) => {
    const profile = profilesByUid[fUid]
    return {
      uid: fUid,
      displayName: profile?.displayName ?? friendMeta[fUid]?.displayName ?? fUid,
      status: (profile?.status as OnlineStatus) ?? 'offline',
      lastSeen: profile?.lastSeen ?? 0,
    }
  })

  return friends
}

/** Get pending incoming friend requests for a user. */
export async function getIncomingRequests(uid: string): Promise<FriendRequest[]> {
  const db = getFirebaseDb()
  if (!db) return []

  const snap = await getDocs(
    query(
      collection(db, REQUESTS_COL),
      where('toUid', '==', uid),
      where('status', '==', 'pending'),
    ),
  )
  return snap.docs.map((d) => d.data() as FriendRequest)
}

/** Subscribe to real-time incoming friend requests. */
export function subscribeToIncomingRequests(
  uid: string,
  callback: (requests: FriendRequest[]) => void,
): Unsubscribe {
  const db = getFirebaseDb()
  if (!db) return () => {}

  const q = query(
    collection(db, REQUESTS_COL),
    where('toUid', '==', uid),
    where('status', '==', 'pending'),
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data() as FriendRequest))
  })
}

/** Subscribe to the friends list for a user (real-time). */
export function subscribeToFriends(
  uid: string,
  callback: (friends: Friend[]) => void,
): Unsubscribe {
  const db = getFirebaseDb()
  if (!db) {
    callback([])
    return () => {}
  }

  // Watch accepted requests where user is sender
  const unsubSent = onSnapshot(
    query(
      collection(db, REQUESTS_COL),
      where('fromUid', '==', uid),
      where('status', '==', 'accepted'),
    ),
    () => {
      getFriends(uid).then(callback).catch(() => callback([]))
    },
  )

  // Watch accepted requests where user is receiver
  const unsubReceived = onSnapshot(
    query(
      collection(db, REQUESTS_COL),
      where('toUid', '==', uid),
      where('status', '==', 'accepted'),
    ),
    () => {
      getFriends(uid).then(callback).catch(() => callback([]))
    },
  )

  return () => {
    unsubSent()
    unsubReceived()
  }
}

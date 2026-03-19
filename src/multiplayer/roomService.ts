import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirebaseDb } from '../auth/firebase'
import type { MultiplayerRoom, RoomPlayer, ChatMessage, MultiplayerAction } from './types'
import type { GameState, Variant } from '../game/types'
import { filterText } from './profanityFilter'

const ROOMS_COL = 'multiplayerRooms'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function maxPlayers(variant: Variant): number {
  if (variant === '4p-partnership') return 4
  if (variant === '3p') return 3
  return 2
}

export async function createRoom(
  hostPlayer: RoomPlayer,
  variant: Variant,
): Promise<string> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firestore not configured')

  const id = crypto.randomUUID()
  const inviteCode = generateInviteCode()

  const room: MultiplayerRoom = {
    id,
    inviteCode,
    variant,
    hostId: hostPlayer.uid,
    players: [hostPlayer],
    status: 'waiting',
    currentPlayerIndex: 0,
    gameState: null,
    pendingAction: null,
    chat: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  await setDoc(doc(collection(db, ROOMS_COL), id), room)
  return id
}

export async function joinRoomByCode(
  code: string,
  player: RoomPlayer,
): Promise<string> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firestore not configured')

  const q = query(
    collection(db, ROOMS_COL),
    where('inviteCode', '==', code.toUpperCase()),
    where('status', '==', 'waiting'),
  )
  const snap = await getDocs(q)
  if (snap.empty) throw new Error('Room not found or already started')

  const roomDoc = snap.docs[0]
  const room = roomDoc.data() as MultiplayerRoom

  if (room.players.length >= maxPlayers(room.variant)) {
    throw new Error('Room is full')
  }
  if (room.players.some(p => p.uid === player.uid)) {
    return roomDoc.id
  }

  await updateDoc(roomDoc.ref, {
    players: [...room.players, player],
    updatedAt: Date.now(),
  })
  return roomDoc.id
}

export async function joinRoomById(
  roomId: string,
  player: RoomPlayer,
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firestore not configured')

  const roomRef = doc(db, ROOMS_COL, roomId)
  const snap = await getDoc(roomRef)
  if (!snap.exists()) throw new Error('Room not found')

  const room = snap.data() as MultiplayerRoom
  if (room.status !== 'waiting') throw new Error('Room already started')
  if (room.players.length >= maxPlayers(room.variant)) throw new Error('Room is full')
  if (room.players.some(p => p.uid === player.uid)) return

  await updateDoc(roomRef, {
    players: [...room.players, player],
    updatedAt: Date.now(),
  })
}

export async function findQuickMatch(
  variant: Variant,
): Promise<string | null> {
  const db = getFirebaseDb()
  if (!db) return null

  const q = query(
    collection(db, ROOMS_COL),
    where('status', '==', 'waiting'),
    where('variant', '==', variant),
  )
  const snap = await getDocs(q)

  for (const d of snap.docs) {
    const room = d.data() as MultiplayerRoom
    if (room.players.length < maxPlayers(variant)) return d.id
  }
  return null
}

export async function updatePlayerPresence(
  roomId: string,
  uid: string,
  isConnected: boolean,
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return
  const roomRef = doc(db, ROOMS_COL, roomId)
  const snap = await getDoc(roomRef)
  if (!snap.exists()) return
  const room = snap.data() as MultiplayerRoom
  const players = room.players.map(p =>
    p.uid === uid ? { ...p, isConnected, lastSeen: Date.now() } : p,
  )
  await updateDoc(roomRef, { players, updatedAt: Date.now() })
}

export async function updateRoomGameState(
  roomId: string,
  gameState: GameState,
  currentPlayerIndex: number,
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return
  await updateDoc(doc(db, ROOMS_COL, roomId), {
    gameState,
    currentPlayerIndex,
    status: gameState.matchOver ? 'finished' : 'in-progress',
    pendingAction: null,
    updatedAt: Date.now(),
  })
}

export async function startRoom(
  roomId: string,
  gameState: GameState,
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firestore not configured')
  await updateDoc(doc(db, ROOMS_COL, roomId), {
    gameState,
    status: 'in-progress',
    currentPlayerIndex: 0,
    updatedAt: Date.now(),
  })
}

export async function submitAction(
  roomId: string,
  action: MultiplayerAction,
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firestore not configured')
  await updateDoc(doc(db, ROOMS_COL, roomId), {
    pendingAction: action,
    updatedAt: Date.now(),
  })
}

export async function sendChatMessage(
  roomId: string,
  message: ChatMessage,
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return
  const snap = await getDoc(doc(db, ROOMS_COL, roomId))
  if (!snap.exists()) return
  const room = snap.data() as MultiplayerRoom
  const chat = [...room.chat, { ...message, text: filterText(message.text) }].slice(-50)
  await updateDoc(doc(db, ROOMS_COL, roomId), { chat, updatedAt: Date.now() })
}

export function subscribeToRoom(
  roomId: string,
  callback: (room: MultiplayerRoom) => void,
): Unsubscribe {
  const db = getFirebaseDb()
  if (!db) return () => {}
  return onSnapshot(doc(db, ROOMS_COL, roomId), (snap) => {
    if (snap.exists()) callback(snap.data() as MultiplayerRoom)
  })
}

export async function setPlayerReady(
  roomId: string,
  uid: string,
  isReady: boolean,
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) return
  const snap = await getDoc(doc(db, ROOMS_COL, roomId))
  if (!snap.exists()) return
  const room = snap.data() as MultiplayerRoom
  const players = room.players.map(p =>
    p.uid === uid ? { ...p, isReady } : p,
  )
  await updateDoc(doc(db, ROOMS_COL, roomId), { players, updatedAt: Date.now() })
}

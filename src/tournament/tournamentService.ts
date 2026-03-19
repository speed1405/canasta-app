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
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirebaseDb } from '../auth/firebase'
import type { Tournament, TournamentPlayer, TournamentMatch, TournamentFormat } from './types'
import type { Variant } from '../game/types'

const TOURNAMENTS_COL = 'tournaments'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateRoundRobinMatches(players: TournamentPlayer[]): TournamentMatch[] {
  const matches: TournamentMatch[] = []
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        id: crypto.randomUUID(),
        round: 1,
        player1Uid: players[i].uid,
        player2Uid: players[j].uid,
        player1Score: 0,
        player2Score: 0,
        winnerUid: null,
        status: 'pending',
        finishedAt: null,
      })
    }
  }
  return matches
}

function generateEliminationMatches(players: TournamentPlayer[]): TournamentMatch[] {
  const matches: TournamentMatch[] = []
  // Pair seeds: 1 vs last, 2 vs second-last, etc.
  const sorted = [...players].sort((a, b) => a.seed - b.seed)
  const n = sorted.length
  for (let i = 0; i < Math.floor(n / 2); i++) {
    matches.push({
      id: crypto.randomUUID(),
      round: 1,
      player1Uid: sorted[i].uid,
      player2Uid: sorted[n - 1 - i].uid,
      player1Score: 0,
      player2Score: 0,
      winnerUid: null,
      status: 'pending',
      finishedAt: null,
    })
  }
  // Subsequent rounds will be populated as matches are reported
  return matches
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function createTournament(
  name: string,
  variant: Variant,
  format: TournamentFormat,
  maxPlayers: number,
  creator: TournamentPlayer,
): Promise<string> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firestore not configured')

  const id = crypto.randomUUID()
  const tournament: Tournament = {
    id,
    name: name.trim(),
    variant,
    format,
    status: 'registering',
    maxPlayers,
    players: [creator],
    matches: [],
    rounds: 0,
    createdBy: creator.uid,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  await setDoc(doc(collection(db, TOURNAMENTS_COL), id), tournament)
  return id
}

export async function joinTournament(tournamentId: string, player: TournamentPlayer): Promise<void> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firestore not configured')

  const ref = doc(db, TOURNAMENTS_COL, tournamentId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Tournament not found')

  const t = snap.data() as Tournament
  if (t.status !== 'registering') throw new Error('Tournament has already started')
  if (t.players.length >= t.maxPlayers) throw new Error('Tournament is full')
  if (t.players.some(p => p.uid === player.uid)) throw new Error('Already joined')

  const updated: TournamentPlayer[] = [
    ...t.players,
    { ...player, seed: t.players.length + 1 },
  ]
  await updateDoc(ref, { players: updated, updatedAt: Date.now() })
}

export async function startTournament(tournamentId: string): Promise<void> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firestore not configured')

  const ref = doc(db, TOURNAMENTS_COL, tournamentId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Tournament not found')

  const t = snap.data() as Tournament
  if (t.status !== 'registering') throw new Error('Tournament has already started')
  if (t.players.length < 2) throw new Error('Need at least 2 players to start')

  const matches =
    t.format === 'round-robin'
      ? generateRoundRobinMatches(t.players)
      : generateEliminationMatches(t.players)

  const rounds =
    t.format === 'round-robin'
      ? 1 // Round-robin uses a single round; all pairings are played within it
      : Math.ceil(Math.log2(t.players.length))

  await updateDoc(ref, {
    status: 'in-progress',
    matches,
    rounds,
    updatedAt: Date.now(),
  })
}

export async function reportMatchResult(
  tournamentId: string,
  matchId: string,
  winnerUid: string,
  player1Score: number,
  player2Score: number,
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) throw new Error('Firestore not configured')

  const ref = doc(db, TOURNAMENTS_COL, tournamentId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Tournament not found')

  const t = snap.data() as Tournament
  const matchIndex = t.matches.findIndex(m => m.id === matchId)
  if (matchIndex === -1) throw new Error('Match not found')

  const updatedMatch: TournamentMatch = {
    ...t.matches[matchIndex],
    winnerUid,
    player1Score,
    player2Score,
    status: 'finished',
    finishedAt: new Date().toISOString(),
  }

  const updatedMatches = [...t.matches]
  updatedMatches[matchIndex] = updatedMatch

  // Update player win/loss and points
  const updatedPlayers = t.players.map(p => {
    if (p.uid === winnerUid) {
      return { ...p, wins: p.wins + 1, points: p.points + (t.format === 'round-robin' ? 3 : 1) }
    }
    const isLoser =
      p.uid === updatedMatch.player1Uid || p.uid === updatedMatch.player2Uid
    if (isLoser) {
      return { ...p, losses: p.losses + 1 }
    }
    return p
  })

  // Check if tournament is finished
  const allDone = updatedMatches.every(m => m.status === 'finished')
  const newStatus = allDone ? 'finished' : 'in-progress'

  await updateDoc(ref, {
    matches: updatedMatches,
    players: updatedPlayers,
    status: newStatus,
    updatedAt: Date.now(),
  })
}

export async function listOpenTournaments(): Promise<Tournament[]> {
  const db = getFirebaseDb()
  if (!db) return []

  const q = query(
    collection(db, TOURNAMENTS_COL),
    where('status', 'in', ['registering', 'in-progress']),
    orderBy('createdAt', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as Tournament)
}

export async function getTournament(tournamentId: string): Promise<Tournament | null> {
  const db = getFirebaseDb()
  if (!db) return null

  const snap = await getDoc(doc(db, TOURNAMENTS_COL, tournamentId))
  return snap.exists() ? (snap.data() as Tournament) : null
}

export function subscribeToTournament(
  tournamentId: string,
  onChange: (t: Tournament | null) => void,
): Unsubscribe {
  const db = getFirebaseDb()
  if (!db) {
    onChange(null)
    return () => {}
  }

  return onSnapshot(doc(db, TOURNAMENTS_COL, tournamentId), (snap) => {
    onChange(snap.exists() ? (snap.data() as Tournament) : null)
  })
}

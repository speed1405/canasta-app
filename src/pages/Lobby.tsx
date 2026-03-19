import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getFirebaseDb } from '../auth/firebase'
import {
  createRoom,
  joinRoomByCode,
  joinRoomById,
  findQuickMatch,
  subscribeToRoom,
  setPlayerReady,
  startRoom,
  updatePlayerPresence,
} from '../multiplayer/roomService'
import type { MultiplayerRoom, RoomPlayer } from '../multiplayer/types'
import type { Variant } from '../game/types'
import { initGame } from '../game/gameEngine'
import { MultiplayerGame } from './MultiplayerGame'

// ─── Helper: build a RoomPlayer from the current auth user ───────────────────

function buildRoomPlayer(
  uid: string,
  displayName: string,
  isHost: boolean,
): RoomPlayer {
  return {
    uid,
    displayName,
    isHost,
    isReady: isHost, // host is auto-ready
    isConnected: true,
    lastSeen: Date.now(),
  }
}

function maxForVariant(variant: Variant): number {
  if (variant === '4p-partnership') return 4
  if (variant === '3p') return 3
  return 2
}

// ─── Lobby ────────────────────────────────────────────────────────────────────

export function Lobby() {
  const { currentUser, loading } = useAuth()
  const navigate = useNavigate()
  const { roomId: paramRoomId } = useParams<{ roomId: string }>()

  const [createVariant, setCreateVariant] = useState<Variant>('2p')
  const [quickVariant, setQuickVariant] = useState<Variant>('2p')
  const [joinCode, setJoinCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [room, setRoom] = useState<MultiplayerRoom | null>(null)
  const [roomId, setRoomId] = useState<string | null>(paramRoomId ?? null)

  const myUid = currentUser?.uid ?? null
  const myDisplayName = currentUser?.displayName ?? currentUser?.email ?? 'Player'

  // Subscribe to room once we have a roomId
  useEffect(() => {
    if (!roomId) return
    const unsub = subscribeToRoom(roomId, (r) => setRoom(r))
    return unsub
  }, [roomId])

  // Update presence on mount/unmount
  useEffect(() => {
    if (!roomId || !myUid) return
    updatePlayerPresence(roomId, myUid, true)
    return () => {
      updatePlayerPresence(roomId, myUid, false)
    }
  }, [roomId, myUid])

  // Firebase not configured
  if (!getFirebaseDb()) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center p-6">
        <div className="bg-white/10 rounded-2xl p-8 max-w-sm text-center space-y-4">
          <div className="text-5xl">🔌</div>
          <h2 className="text-2xl font-bold">Multiplayer Unavailable</h2>
          <p className="text-slate-300">
            Multiplayer requires Firebase configuration. Please set up your Firebase environment variables.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 px-6 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-white border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center p-6">
        <div className="bg-white/10 rounded-2xl p-8 max-w-sm text-center space-y-4">
          <div className="text-5xl">🔑</div>
          <h2 className="text-2xl font-bold">Sign In Required</h2>
          <p className="text-slate-300">
            Online multiplayer requires a free account. Sign in or register to play against real people.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition-colors font-medium"
            >
              Register
            </button>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    )
  }

  // If we have a room and it's in-progress, show the game
  if (room && room.status === 'in-progress') {
    return <MultiplayerGame room={room} myUid={myUid!} roomId={roomId!} />
  }

  // Waiting room
  if (room && roomId) {
    return (
      <WaitingRoom
        room={room}
        roomId={roomId}
        myUid={myUid!}
        onLeave={() => {
          setRoom(null)
          setRoomId(null)
          navigate('/lobby')
        }}
      />
    )
  }

  // Main lobby
  async function handleCreate() {
    setBusy(true)
    setError('')
    try {
      const player = buildRoomPlayer(myUid!, myDisplayName, true)
      const id = await createRoom(player, createVariant)
      setRoomId(id)
      navigate(`/lobby/${id}`, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create room')
    } finally {
      setBusy(false)
    }
  }

  async function handleJoin() {
    if (joinCode.trim().length !== 6) {
      setError('Enter a 6-character invite code')
      return
    }
    setBusy(true)
    setError('')
    try {
      const player = buildRoomPlayer(myUid!, myDisplayName, false)
      const id = await joinRoomByCode(joinCode.trim(), player)
      setRoomId(id)
      navigate(`/lobby/${id}`, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join room')
    } finally {
      setBusy(false)
    }
  }

  async function handleQuickMatch() {
    setBusy(true)
    setError('')
    try {
      const id = await findQuickMatch(quickVariant)
      if (id) {
        const player = buildRoomPlayer(myUid!, myDisplayName, false)
        await joinRoomById(id, player)
        setRoomId(id)
        navigate(`/lobby/${id}`, { replace: true })
      } else {
        // No match found — create a room and wait
        const player = buildRoomPlayer(myUid!, myDisplayName, true)
        const newId = await createRoom(player, quickVariant)
        setRoomId(newId)
        navigate(`/lobby/${newId}`, { replace: true })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to find match')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white transition-colors text-lg"
            aria-label="Back to home"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-bold">🌐 Multiplayer</h1>
            <p className="text-slate-400 text-sm mt-1">Play Canasta online against real people</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Create Room */}
          <div className="bg-white/10 rounded-2xl p-6 space-y-4 border border-white/10">
            <div className="text-2xl">🏠</div>
            <h2 className="text-xl font-bold">Create Room</h2>
            <p className="text-slate-400 text-sm">Start a private room and invite friends with a code.</p>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Variant</label>
              <select
                value={createVariant}
                onChange={e => setCreateVariant(e.target.value as Variant)}
                className="w-full bg-slate-700 rounded-xl px-3 py-2 text-white text-sm"
              >
                <option value="2p">2 Players</option>
                <option value="3p">3 Players</option>
                <option value="4p-partnership">4 Players (Partnership)</option>
              </select>
            </div>
            <button
              onClick={handleCreate}
              disabled={busy}
              className="w-full py-2 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 disabled:opacity-50 transition-colors"
            >
              {busy ? 'Creating…' : 'Create Room'}
            </button>
          </div>

          {/* Join by Code */}
          <div className="bg-white/10 rounded-2xl p-6 space-y-4 border border-white/10">
            <div className="text-2xl">🔗</div>
            <h2 className="text-xl font-bold">Join by Code</h2>
            <p className="text-slate-400 text-sm">Enter a 6-character invite code to join a friend's room.</p>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Invite Code</label>
              <input
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="ABCD12"
                maxLength={6}
                className="w-full bg-slate-700 rounded-xl px-3 py-2 text-white text-sm tracking-widest font-mono placeholder-slate-500"
              />
            </div>
            <button
              onClick={handleJoin}
              disabled={busy || joinCode.length !== 6}
              className="w-full py-2 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 disabled:opacity-50 transition-colors"
            >
              {busy ? 'Joining…' : 'Join Room'}
            </button>
          </div>

          {/* Quick Match */}
          <div className="bg-white/10 rounded-2xl p-6 space-y-4 border border-white/10 sm:col-span-2">
            <div className="text-2xl">⚡</div>
            <h2 className="text-xl font-bold">Quick Match</h2>
            <p className="text-slate-400 text-sm">Find an open room automatically, or create one and wait for others.</p>
            <div className="flex gap-3">
              <select
                value={quickVariant}
                onChange={e => setQuickVariant(e.target.value as Variant)}
                className="flex-1 bg-slate-700 rounded-xl px-3 py-2 text-white text-sm"
              >
                <option value="2p">2 Players</option>
                <option value="3p">3 Players</option>
                <option value="4p-partnership">4 Players (Partnership)</option>
              </select>
              <button
                onClick={handleQuickMatch}
                disabled={busy}
                className="px-6 py-2 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                {busy ? 'Finding…' : 'Find Match'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── WaitingRoom ──────────────────────────────────────────────────────────────

interface WaitingRoomProps {
  room: MultiplayerRoom
  roomId: string
  myUid: string
  onLeave: () => void
}

function WaitingRoom({ room, roomId, myUid, onLeave }: WaitingRoomProps) {
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const isHost = room.hostId === myUid
  const myPlayer = room.players.find(p => p.uid === myUid)
  const allConnectedReady = room.players.length > 1 && room.players.every(p => p.isReady)
  const maxP = maxForVariant(room.variant)

  async function toggleReady() {
    if (!myPlayer) return
    setBusy(true)
    try {
      await setPlayerReady(roomId, myUid, !myPlayer.isReady)
    } finally {
      setBusy(false)
    }
  }

  async function handleStart() {
    setBusy(true)
    setError('')
    try {
      const numPlayers = room.players.length
      const { state } = initGame(room.variant, 'medium', numPlayers)
      // Reassign player ids/names to match room seats
      const gameState = {
        ...state,
        players: state.players.map((p, i) => ({
          ...p,
          id: room.players[i]?.uid ?? p.id,
          name: room.players[i]?.displayName ?? p.name,
          type: 'human' as const,
        })),
      }
      await startRoom(roomId, gameState)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start game')
    } finally {
      setBusy(false)
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(room.inviteCode).catch(() => null)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="max-w-lg mx-auto px-4 py-12 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLeave}
            className="text-slate-400 hover:text-white transition-colors text-lg"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold">Waiting Room</h1>
          <span className="ml-auto text-slate-400 text-sm capitalize">{room.variant}</span>
        </div>

        {/* Invite code */}
        <div className="bg-white/10 rounded-2xl p-6 text-center border border-white/10">
          <p className="text-slate-400 text-sm mb-2">Invite Code</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl font-mono font-bold tracking-widest text-yellow-300">
              {room.inviteCode}
            </span>
            <button
              onClick={copyCode}
              className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-sm transition-colors"
            >
              {copied ? '✅ Copied' : '📋 Copy'}
            </button>
          </div>
          <p className="text-slate-500 text-xs mt-2">
            {room.players.length}/{maxP} players joined
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Player list */}
        <div className="bg-white/10 rounded-2xl p-4 border border-white/10 space-y-2">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Players
          </h2>
          {room.players.map((p, i) => (
            <div
              key={p.uid}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
            >
              <span className="text-slate-400 text-sm w-6 text-center">#{i + 1}</span>
              <span className={`w-2 h-2 rounded-full ${p.isConnected ? 'bg-green-400' : 'bg-slate-500'}`} />
              <span className="flex-1 font-medium">{p.displayName}</span>
              {p.isHost && <span className="text-xs text-yellow-400 font-medium">HOST</span>}
              <span className={`text-xs font-medium ${p.isReady ? 'text-green-400' : 'text-slate-500'}`}>
                {p.isReady ? '✓ Ready' : 'Not ready'}
              </span>
            </div>
          ))}
          {/* Empty seats */}
          {Array.from({ length: maxP - room.players.length }).map((_, i) => (
            <div key={`empty-${i}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 opacity-40">
              <span className="text-slate-400 text-sm w-6 text-center">#{room.players.length + i + 1}</span>
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span className="flex-1 text-slate-500 italic">Waiting for player…</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {!isHost && (
            <button
              onClick={toggleReady}
              disabled={busy}
              className={`w-full py-3 rounded-xl font-bold transition-colors disabled:opacity-50 ${
                myPlayer?.isReady
                  ? 'bg-slate-600 hover:bg-slate-500 text-white'
                  : 'bg-green-600 hover:bg-green-500 text-white'
              }`}
            >
              {myPlayer?.isReady ? 'Unready' : '✓ Ready'}
            </button>
          )}
          {isHost && (
            <button
              onClick={handleStart}
              disabled={busy || !allConnectedReady || room.players.length < 2}
              className="w-full py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 disabled:opacity-50 transition-colors"
            >
              {busy ? 'Starting…' : room.players.length < 2 ? 'Waiting for players…' : !allConnectedReady ? 'Waiting for everyone to ready up…' : '🎮 Start Game'}
            </button>
          )}
          <button
            onClick={onLeave}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-medium"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageLayout } from '../components/PageLayout'
import { useAuth } from '../auth/AuthContext'
import { deleteAllCloudData } from '../auth/cloudSync'
import {
  getFriends,
  getIncomingRequests,
  sendFriendRequest,
  respondToFriendRequest,
} from '../social/friendService'
import type { Friend, FriendRequest } from '../social/types'
import { getUnlocked, ACHIEVEMENTS } from '../achievements/achievementService'
import type { AchievementUnlock } from '../achievements/types'

/** Returns a Gravatar URL for the given email, falling back to a generated avatar. */
function gravatarUrl(email: string, size = 80): string {
  // MD5-like hash via a simpler approach — use email directly as a seed for
  // DiceBear to avoid a crypto dependency.  Gravatar needs MD5, so we use the
  // initials-based avatar as a safe fallback that always works.
  const encoded = encodeURIComponent(email.trim().toLowerCase())
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encoded}&size=${size}`
}

export function Profile() {
  const { currentUser, signOut, updateDisplayName, deleteAccount } = useAuth()
  const navigate = useNavigate()

  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(currentUser?.displayName ?? '')
  const [nameBusy, setNameBusy] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Friends state
  const [friends, setFriends] = useState<Friend[]>([])
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([])
  const [addFriendInput, setAddFriendInput] = useState('')
  const [addFriendBusy, setAddFriendBusy] = useState(false)
  const [addFriendMsg, setAddFriendMsg] = useState<string | null>(null)

  // Achievements state
  const [unlockedAchievements, setUnlockedAchievements] = useState<AchievementUnlock[]>([])

  useEffect(() => {
    if (!currentUser) return
    // Load friends
    getFriends(currentUser.uid).then(setFriends).catch(() => {})
    getIncomingRequests(currentUser.uid).then(setIncomingRequests).catch(() => {})
    // Load achievements
    setUnlockedAchievements(getUnlocked())
  }, [currentUser])

  // Guest fallback
  if (!currentUser) {
    return (
      <PageLayout title="Profile">
        <div className="text-center space-y-4 py-12">
          <div className="text-5xl" aria-hidden="true">👤</div>
          <h2 className="text-xl font-bold">You're playing as a guest</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
            Create an account to save your stats and progress across devices.
          </p>
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Link
              to="/register"
              className="py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="py-3 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-center transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </PageLayout>
    )
  }

  const email = currentUser.email ?? ''
  const displayName = currentUser.displayName ?? email
  const createdAt = currentUser.metadata.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
    : '—'
  const avatarUrl = gravatarUrl(email)

  async function handleSaveName() {
    if (!newName.trim()) {
      setNameError('Display name cannot be empty.')
      return
    }
    setNameError(null)
    setNameBusy(true)
    try {
      await updateDisplayName(newName.trim())
      setEditingName(false)
    } catch {
      setNameError('Failed to update name. Please try again.')
    } finally {
      setNameBusy(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  async function handleDeleteAccount() {
    setDeleteBusy(true)
    setDeleteError(null)
    try {
      if (currentUser) await deleteAllCloudData(currentUser)
      await deleteAccount()
      navigate('/')
    } catch (err: unknown) {
      const code = err && typeof err === 'object' && 'code' in err
        ? (err as { code: string }).code
        : ''
      if (code === 'auth/requires-recent-login') {
        setDeleteError('For security, please sign out and sign back in before deleting your account.')
      } else {
        setDeleteError('Failed to delete account. Please try again.')
      }
      setDeleteBusy(false)
    }
  }

  async function handleSendFriendRequest() {
    if (!addFriendInput.trim() || !currentUser) return
    setAddFriendBusy(true)
    setAddFriendMsg(null)
    try {
      await sendFriendRequest(
        currentUser.uid,
        currentUser.displayName ?? currentUser.email ?? 'Unknown',
        addFriendInput.trim(),
        addFriendInput.trim(),
      )
      setAddFriendMsg('Friend request sent!')
      setAddFriendInput('')
    } catch {
      setAddFriendMsg('Failed to send request. Check the UID and try again.')
    } finally {
      setAddFriendBusy(false)
    }
  }

  async function handleRespondRequest(requestId: string, accept: boolean) {
    try {
      await respondToFriendRequest(requestId, accept)
      setIncomingRequests((prev) => prev.filter((r) => r.id !== requestId))
      if (accept && currentUser) {
        getFriends(currentUser.uid).then(setFriends).catch(() => {})
      }
    } catch { /* ignore */ }
  }

  const statusColors: Record<string, string> = {
    online: 'bg-green-500',
    'in-game': 'bg-yellow-500',
    offline: 'bg-slate-400',
  }

  return (
    <PageLayout title="Profile">
      <div className="space-y-8">
        {/* Avatar + identity */}
        <section className="flex items-center gap-5">
          <img
            src={currentUser.photoURL ?? avatarUrl}
            alt={`Avatar for ${displayName}`}
            width={64}
            height={64}
            className="rounded-full border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
          />
          <div>
            <div className="text-lg font-bold">{displayName}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{email}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Member since {createdAt}
            </div>
          </div>
        </section>

        {/* Edit display name */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
          <h2 className="font-semibold">Display Name</h2>
          {editingName ? (
            <div className="space-y-3">
              {nameError && (
                <p role="alert" className="text-red-600 dark:text-red-400 text-sm">{nameError}</p>
              )}
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                aria-label="New display name"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveName}
                  disabled={nameBusy}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
                >
                  {nameBusy ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditingName(false); setNameError(null); setNewName(currentUser.displayName ?? '') }}
                  className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">{displayName}</span>
              <button
                onClick={() => setEditingName(true)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Edit
              </button>
            </div>
          )}
        </section>

        {/* Friends */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
          <h2 className="font-semibold">Friends</h2>

          {/* Incoming requests */}
          {incomingRequests.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending requests</div>
              {incomingRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{req.fromDisplayName}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespondRequest(req.id, true)}
                      className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondRequest(req.id, false)}
                      className="px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Friends list */}
          {friends.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You have no friends yet. Add someone by their user ID below.
            </p>
          ) : (
            <ul className="space-y-2">
              {friends.map((f) => (
                <li key={f.uid} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${statusColors[f.status] ?? 'bg-slate-400'}`}
                      aria-label={f.status}
                    />
                    <span className="font-medium">{f.displayName}</span>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">{f.status}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Add friend by UID */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Add a friend</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={addFriendInput}
                onChange={(e) => setAddFriendInput(e.target.value)}
                placeholder="Friend's user ID"
                aria-label="Friend's user ID"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendFriendRequest}
                disabled={addFriendBusy || !addFriendInput.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
              >
                {addFriendBusy ? '…' : 'Send'}
              </button>
            </div>
            {addFriendMsg && (
              <p className="text-sm text-green-600 dark:text-green-400">{addFriendMsg}</p>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Your user ID: <span className="font-mono">{currentUser.uid}</span>
            </p>
          </div>
        </section>

        {/* Achievements */}
        <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Achievements</h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {unlockedAchievements.length} / {ACHIEVEMENTS.length}
            </span>
          </div>
          {ACHIEVEMENTS.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No achievements yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {ACHIEVEMENTS.map((def) => {
                const achieveUnlock = unlockedAchievements.find((u) => u.achievementId === def.id)
                return (
                  <div
                    key={def.id}
                    className={`rounded-xl p-3 border transition-opacity ${
                      achieveUnlock
                        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-slate-200 dark:border-slate-700 opacity-40'
                    }`}
                    title={achieveUnlock ? `Unlocked ${new Date(achieveUnlock.unlockedAt).toLocaleDateString()}` : 'Locked'}
                  >
                    <div className="text-2xl mb-1" aria-hidden="true">{def.icon}</div>
                    <div className="text-xs font-semibold leading-tight">{def.title}</div>
                    {achieveUnlock && (
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {new Date(achieveUnlock.unlockedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Account actions */}
        <section className="space-y-3">
          <button
            onClick={handleSignOut}
            className="w-full py-3 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold transition-colors"
          >
            Sign Out
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold transition-colors"
          >
            Delete My Account
          </button>
        </section>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h2 id="delete-title" className="text-lg font-bold">Delete account?</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              This will permanently delete your account and all cloud-saved data (stats, lesson progress, practice results). This cannot be undone.
            </p>
            {deleteError && (
              <p role="alert" className="text-red-600 dark:text-red-400 text-sm">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteError(null) }}
                disabled={deleteBusy}
                className="flex-1 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteBusy}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold transition-colors"
              >
                {deleteBusy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}

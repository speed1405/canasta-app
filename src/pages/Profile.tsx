import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageLayout } from '../components/PageLayout'
import { useAuth } from '../auth/AuthContext'
import { deleteAllCloudData } from '../auth/cloudSync'

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

        {/* Actions */}
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

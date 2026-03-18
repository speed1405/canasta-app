import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { isFirebaseConfigured } from '../auth/firebase'

type State = 'idle' | 'success' | 'error'

export function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [busy, setBusy] = useState(false)

  if (!isFirebaseConfigured()) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center space-y-4">
          <div className="text-4xl">🔒</div>
          <h1 className="text-xl font-bold">Not Available</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Password reset requires Firebase configuration.
          </p>
          <Link
            to="/"
            className="block w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorMsg('')
    setBusy(true)
    try {
      await resetPassword(email)
      setState('success')
    } catch (err: unknown) {
      setState('error')
      setErrorMsg(friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 space-y-6">
        <header className="text-center">
          <div className="text-4xl mb-2" aria-hidden="true">🔑</div>
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enter your email and we'll send you a reset link
          </p>
        </header>

        {state === 'success' && (
          <div role="status" className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 rounded-xl p-4 text-sm text-center">
            ✅ Check your inbox for the password reset link.
          </div>
        )}

        {state === 'error' && (
          <div role="alert" className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl p-3 text-sm">
            {errorMsg}
          </div>
        )}

        {state !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold transition-colors"
            >
              {busy ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

function friendlyError(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/invalid-email': return 'No account found with this email address.'
      case 'auth/network-request-failed': return 'Network error. Check your connection.'
    }
  }
  return 'An error occurred. Please try again.'
}

import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { isFirebaseConfigured } from '../auth/firebase'
import { mergeGuestDataToCloud } from '../auth/cloudSync'

export function Login() {
  const { signIn, signInWithGoogle, currentUser } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Already signed in — redirect to profile
  if (currentUser) {
    navigate('/profile', { replace: true })
    return null
  }

  if (!isFirebaseConfigured()) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center space-y-4">
          <div className="text-4xl">🔒</div>
          <h1 className="text-xl font-bold">Sign In Unavailable</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cloud accounts require Firebase configuration. You can continue playing as a guest — all your data is saved locally.
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
    setError(null)
    setBusy(true)
    try {
      await signIn(email, password)
      // Merge any guest data that was collected before sign-in
      const { getFirebaseAuth } = await import('../auth/firebase')
      const auth = getFirebaseAuth()
      if (auth?.currentUser) await mergeGuestDataToCloud(auth.currentUser)
      navigate('/')
    } catch (err: unknown) {
      setError(friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setBusy(true)
    try {
      await signInWithGoogle()
      const { getFirebaseAuth } = await import('../auth/firebase')
      const auth = getFirebaseAuth()
      if (auth?.currentUser) await mergeGuestDataToCloud(auth.currentUser)
      navigate('/')
    } catch (err: unknown) {
      setError(friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 space-y-6">
        <header className="text-center">
          <div className="text-4xl mb-2" aria-hidden="true">🃏</div>
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access your cloud-saved stats and progress
          </p>
        </header>

        {error && (
          <div role="alert" className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold transition-colors"
          >
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="relative flex items-center gap-3 text-slate-400">
          <span className="flex-1 border-t border-slate-200 dark:border-slate-600" />
          <span className="text-sm">or</span>
          <span className="flex-1 border-t border-slate-200 dark:border-slate-600" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={busy}
          className="w-full py-3 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-60 font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <GoogleIcon />
          Sign in with Google
        </button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Register
          </Link>
        </p>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          <Link to="/" className="hover:underline">
            Continue as guest ›
          </Link>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function friendlyError(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code
    switch (code) {
      case 'auth/invalid-email': return 'Invalid email address.'
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential': return 'Incorrect email or password.'
      case 'auth/too-many-requests': return 'Too many attempts. Please try again later.'
      case 'auth/popup-closed-by-user': return 'Sign-in popup was closed. Please try again.'
      case 'auth/network-request-failed': return 'Network error. Check your connection.'
    }
  }
  return 'An error occurred. Please try again.'
}

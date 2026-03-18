/**
 * AuthContext — provides auth state (current user) and auth actions
 * (sign-in, sign-up, sign-out, etc.) to the whole app.
 *
 * When Firebase is not configured the context falls back to guest-only mode:
 * all auth actions resolve without error and `currentUser` stays null.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { getFirebaseAuth } from './firebase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthContextValue {
  /** The currently signed-in Firebase user, or null for guests. */
  currentUser: User | null
  /** True while the initial auth state is being determined. */
  loading: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateDisplayName: (name: string) => Promise<void>
  deleteAccount: () => Promise<void>
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Subscribe to Firebase auth state changes.
  // When Firebase is not configured we immediately resolve with no user.
  useEffect(() => {
    const auth = getFirebaseAuth()
    if (!auth) {
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const auth = getFirebaseAuth()
      if (!auth) throw new Error('Auth not configured')
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName })
    },
    [],
  )

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('Auth not configured')
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('Auth not configured')
    await signInWithPopup(auth, new GoogleAuthProvider())
  }, [])

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth()
    if (auth) await firebaseSignOut(auth)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const auth = getFirebaseAuth()
    if (!auth) throw new Error('Auth not configured')
    await sendPasswordResetEmail(auth, email)
  }, [])

  const updateDisplayName = useCallback(async (name: string) => {
    const auth = getFirebaseAuth()
    if (!auth || !auth.currentUser) throw new Error('Not signed in')
    await updateProfile(auth.currentUser, { displayName: name })
    // Trigger a re-render by updating the local state reference.
    setCurrentUser({ ...auth.currentUser })
  }, [])

  const deleteAccount = useCallback(async () => {
    const auth = getFirebaseAuth()
    if (!auth || !auth.currentUser) throw new Error('Not signed in')
    await deleteUser(auth.currentUser)
  }, [])

  const value: AuthContextValue = {
    currentUser,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateDisplayName,
    deleteAccount,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

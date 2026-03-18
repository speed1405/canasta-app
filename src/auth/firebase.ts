/**
 * Firebase initialisation.
 *
 * Configuration is read from Vite environment variables so that API keys are
 * never committed to source control.  When the environment variables are
 * absent the app continues to work in guest / localStorage-only mode.
 *
 * Required variables (set in .env.local or your hosting environment):
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_STORAGE_BUCKET
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

function getConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
    appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
  }
}

/** Returns true when all required Firebase env vars are present. */
export function isFirebaseConfigured(): boolean {
  const cfg = getConfig()
  return Boolean(
    cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.storageBucket &&
    cfg.messagingSenderId && cfg.appId,
  )
}

let _app: FirebaseApp | null = null
let _auth: Auth | null = null
let _db: Firestore | null = null

function ensureInit(): { app: FirebaseApp; auth: Auth; db: Firestore } | null {
  if (!isFirebaseConfigured()) return null

  if (!_app) {
    const cfg = getConfig()
    _app = getApps().length === 0 ? initializeApp(cfg) : getApps()[0]
    _auth = getAuth(_app)
    _db = getFirestore(_app)
  }

  return { app: _app!, auth: _auth!, db: _db! }
}

export function getFirebaseAuth(): Auth | null {
  return ensureInit()?.auth ?? null
}

export function getFirebaseDb(): Firestore | null {
  return ensureInit()?.db ?? null
}

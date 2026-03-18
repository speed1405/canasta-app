/**
 * Tests for the Login, Register, ForgotPassword, Profile, and PrivacyPolicy
 * pages introduced in Phase 8.
 *
 * Because Firebase is not configured in the test environment, all auth pages
 * that require Firebase fall back to an informational "unavailable" screen.
 * The Profile page shows the guest view since currentUser is null.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../auth/AuthContext'
import { Login } from '../../pages/Login'
import { Register } from '../../pages/Register'
import { ForgotPassword } from '../../pages/ForgotPassword'
import { Profile } from '../../pages/Profile'
import { PrivacyPolicy } from '../../pages/PrivacyPolicy'

function wrap(element: React.ReactElement) {
  return render(
    <AuthProvider>
      <MemoryRouter>{element}</MemoryRouter>
    </AuthProvider>,
  )
}

// ─── Login ────────────────────────────────────────────────────────────────────

describe('Login page (Firebase not configured)', () => {
  it('renders the "unavailable" fallback', () => {
    wrap(<Login />)
    expect(screen.getByText(/sign in unavailable/i)).toBeTruthy()
  })

  it('shows a back-to-home link', () => {
    wrap(<Login />)
    expect(screen.getByRole('link', { name: /back to home/i })).toBeTruthy()
  })
})

// ─── Register ─────────────────────────────────────────────────────────────────

describe('Register page (Firebase not configured)', () => {
  it('renders the "unavailable" fallback', () => {
    wrap(<Register />)
    expect(screen.getByText(/registration unavailable/i)).toBeTruthy()
  })

  it('shows a back-to-home link', () => {
    wrap(<Register />)
    expect(screen.getByRole('link', { name: /back to home/i })).toBeTruthy()
  })
})

// ─── ForgotPassword ───────────────────────────────────────────────────────────

describe('ForgotPassword page (Firebase not configured)', () => {
  it('renders the "not available" fallback', () => {
    wrap(<ForgotPassword />)
    expect(screen.getByText(/not available/i)).toBeTruthy()
  })
})

// ─── Profile ──────────────────────────────────────────────────────────────────

describe('Profile page (guest / no user)', () => {
  it('shows the guest view with sign-in and register links', () => {
    wrap(<Profile />)
    expect(screen.getByText(/you're playing as a guest/i)).toBeTruthy()
  })

  it('has a Create Account link', () => {
    wrap(<Profile />)
    expect(screen.getByRole('link', { name: /create account/i })).toBeTruthy()
  })

  it('has a Sign In link', () => {
    wrap(<Profile />)
    expect(screen.getByRole('link', { name: /sign in/i })).toBeTruthy()
  })
})

// ─── PrivacyPolicy ────────────────────────────────────────────────────────────

describe('PrivacyPolicy page', () => {
  beforeEach(() => {
    wrap(<PrivacyPolicy />)
  })

  it('renders the Privacy Policy heading', () => {
    expect(screen.getByText('Privacy Policy')).toBeTruthy()
  })

  it('includes an Overview section', () => {
    expect(screen.getByText(/overview/i)).toBeTruthy()
  })

  it('includes information about guest users', () => {
    expect(screen.getByText(/guest users/i)).toBeTruthy()
  })

  it('includes a section about user rights', () => {
    expect(screen.getAllByText(/your rights/i).length).toBeGreaterThan(0)
  })

  it('mentions account deletion', () => {
    expect(screen.getAllByText(/delete.*account/i).length).toBeGreaterThan(0)
  })

  it('shows last updated date', () => {
    expect(screen.getByText(/last updated/i)).toBeTruthy()
  })
})

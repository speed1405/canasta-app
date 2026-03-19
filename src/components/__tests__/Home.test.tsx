/**
 * Tests for the Home page main menu introduced to provide structured
 * navigation with grouped sections: Play, Learn & Practice, Community, More.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../../auth/AuthContext'
import { Home } from '../../pages/Home'

function wrap() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('Home — main menu', () => {
  it('renders the Canasta title', () => {
    wrap()
    expect(screen.getByRole('heading', { name: /canasta/i, level: 1 })).toBeTruthy()
  })

  it('renders the main menu nav landmark', () => {
    wrap()
    expect(screen.getByRole('navigation', { name: /main menu/i })).toBeTruthy()
  })

  it('renders the Play section heading', () => {
    wrap()
    expect(screen.getByRole('heading', { name: /^play$/i })).toBeTruthy()
  })

  it('renders the Learn & Practice section heading', () => {
    wrap()
    expect(screen.getByRole('heading', { name: /learn & practice/i })).toBeTruthy()
  })

  it('renders the Community section heading', () => {
    wrap()
    expect(screen.getByRole('heading', { name: /community/i })).toBeTruthy()
  })

  it('renders the More section heading', () => {
    wrap()
    expect(screen.getByRole('heading', { name: /^more$/i })).toBeTruthy()
  })

  it('has a link to the Play vs AI page', () => {
    wrap()
    expect(screen.getByRole('link', { name: /play vs ai/i })).toBeTruthy()
  })

  it('has a link to the Multiplayer lobby', () => {
    wrap()
    expect(screen.getByRole('link', { name: /multiplayer/i })).toBeTruthy()
  })

  it('has a link to Tournaments', () => {
    wrap()
    expect(screen.getByRole('link', { name: /tournaments/i })).toBeTruthy()
  })

  it('has a link to Learn', () => {
    wrap()
    expect(screen.getByRole('link', { name: /learn/i })).toBeTruthy()
  })

  it('has a link to Practice', () => {
    wrap()
    expect(screen.getByRole('link', { name: /practice/i })).toBeTruthy()
  })

  it('has a link to Challenges', () => {
    wrap()
    expect(screen.getByRole('link', { name: /challenges/i })).toBeTruthy()
  })

  it('has a link to Leaderboards', () => {
    wrap()
    expect(screen.getByRole('link', { name: /leaderboards/i })).toBeTruthy()
  })

  it('has a link to Stats', () => {
    wrap()
    expect(screen.getByRole('link', { name: /stats/i })).toBeTruthy()
  })

  it('has a link to Reference', () => {
    wrap()
    expect(screen.getByRole('link', { name: /^reference\b/i })).toBeTruthy()
  })

  it('has a link to Settings', () => {
    wrap()
    expect(screen.getByRole('link', { name: /settings/i })).toBeTruthy()
  })

  it('shows a Sign In link when not authenticated', () => {
    wrap()
    expect(screen.getByRole('link', { name: /sign in/i })).toBeTruthy()
  })

  it('Play vs AI link points to /play', () => {
    wrap()
    const link = screen.getByRole('link', { name: /play vs ai/i }) as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/play')
  })
})

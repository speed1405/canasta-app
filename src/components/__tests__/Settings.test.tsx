import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Settings } from '../../pages/Settings'
import { AuthProvider } from '../../auth/AuthContext'

const PREFS_KEY = 'canasta_prefs'

function renderSettings() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('Settings', () => {
  beforeEach(() => {
    localStorage.removeItem(PREFS_KEY)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.style.removeProperty('--anim-speed')
  })

  it('renders the Settings heading', () => {
    renderSettings()
    expect(screen.getByText('Settings')).toBeTruthy()
  })

  it('renders the Sound section', () => {
    renderSettings()
    expect(screen.getByText('Sound effects')).toBeTruthy()
  })

  it('renders the Animation speed section', () => {
    renderSettings()
    expect(screen.getByText(/animation speed/i)).toBeTruthy()
    expect(screen.getByText('off')).toBeTruthy()
    expect(screen.getByText('normal')).toBeTruthy()
    expect(screen.getByText('fast')).toBeTruthy()
  })

  it('renders the Colour theme section', () => {
    renderSettings()
    expect(screen.getByText(/colour theme/i)).toBeTruthy()
    expect(screen.getByText('system')).toBeTruthy()
    expect(screen.getByText('light')).toBeTruthy()
    expect(screen.getByText('dark')).toBeTruthy()
  })

  it('sound toggle is on by default', () => {
    renderSettings()
    const toggle = screen.getByRole('switch', { name: /sound effects/i })
    expect(toggle.getAttribute('aria-checked')).toBe('true')
  })

  it('toggles sound off when clicked', () => {
    renderSettings()
    const toggle = screen.getByRole('switch', { name: /sound effects/i })
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-checked')).toBe('false')
  })

  it('persists sound preference to localStorage', () => {
    renderSettings()
    const toggle = screen.getByRole('switch', { name: /sound effects/i })
    fireEvent.click(toggle)
    const stored = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}')
    expect(stored.sound).toBe(false)
  })

  it('selecting animation speed persists preference', () => {
    renderSettings()
    const fastBtn = screen.getByRole('button', { name: /fast/i })
    fireEvent.click(fastBtn)
    const stored = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}')
    expect(stored.animSpeed).toBe('fast')
  })

  it('applies --anim-speed CSS property when animation speed is changed', () => {
    renderSettings()
    fireEvent.click(screen.getByRole('button', { name: /off/i }))
    expect(document.documentElement.style.getPropertyValue('--anim-speed')).toBe('0ms')

    fireEvent.click(screen.getByRole('button', { name: /fast/i }))
    expect(document.documentElement.style.getPropertyValue('--anim-speed')).toBe('100ms')

    fireEvent.click(screen.getByRole('button', { name: /normal/i }))
    expect(document.documentElement.style.getPropertyValue('--anim-speed')).toBe('300ms')
  })

  it('selecting dark theme adds dark class to html', () => {
    renderSettings()
    const darkBtn = screen.getByRole('button', { name: /dark/i })
    fireEvent.click(darkBtn)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('selecting light theme adds light class to html', () => {
    renderSettings()
    const lightBtn = screen.getByRole('button', { name: /light/i })
    fireEvent.click(lightBtn)
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('persists theme preference to localStorage', () => {
    renderSettings()
    fireEvent.click(screen.getByRole('button', { name: /dark/i }))
    const stored = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}')
    expect(stored.theme).toBe('dark')
  })

  it('animation speed buttons reflect current selection with aria-pressed', () => {
    renderSettings()
    // By default 'normal' should be pressed
    const normalBtn = screen.getByRole('button', { name: /normal/i })
    expect(normalBtn.getAttribute('aria-pressed')).toBe('true')
    const offBtn = screen.getByRole('button', { name: /off/i })
    expect(offBtn.getAttribute('aria-pressed')).toBe('false')
  })
})

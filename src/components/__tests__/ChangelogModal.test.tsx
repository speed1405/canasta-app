import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChangelogModal } from '../ChangelogModal'
import { shouldShowChangelog, markChangelogSeen, CURRENT_VERSION } from '../../game/changelogVersion'

describe('ChangelogModal', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the "What\'s New" heading', () => {
    render(<ChangelogModal onClose={() => {}} />)
    expect(screen.getByText(/what's new/i)).toBeTruthy()
  })

  it('shows the current version entry', () => {
    render(<ChangelogModal onClose={() => {}} />)
    expect(screen.getByText(new RegExp(`v${CURRENT_VERSION}`))).toBeTruthy()
  })

  it('calls onClose when "Got it!" is clicked and marks changelog seen', async () => {
    const user = userEvent.setup()
    let closed = false
    render(<ChangelogModal onClose={() => { closed = true }} />)
    await user.click(screen.getByRole('button', { name: /got it/i }))
    expect(closed).toBe(true)
    expect(shouldShowChangelog()).toBe(false)
  })

  it('calls onClose when the close (✕) button is clicked', async () => {
    const user = userEvent.setup()
    let closed = false
    render(<ChangelogModal onClose={() => { closed = true }} />)
    await user.click(screen.getByRole('button', { name: /close changelog/i }))
    expect(closed).toBe(true)
  })

  it('marks changelog seen after closing', async () => {
    const user = userEvent.setup()
    render(<ChangelogModal onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /got it/i }))
    expect(shouldShowChangelog()).toBe(false)
  })

  it('has dialog role for accessibility', () => {
    render(<ChangelogModal onClose={() => {}} />)
    expect(screen.getByRole('dialog')).toBeTruthy()
  })
})

describe('changelogVersion utilities', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shouldShowChangelog returns true initially', () => {
    expect(shouldShowChangelog()).toBe(true)
  })

  it('shouldShowChangelog returns false after markChangelogSeen', () => {
    markChangelogSeen()
    expect(shouldShowChangelog()).toBe(false)
  })
})

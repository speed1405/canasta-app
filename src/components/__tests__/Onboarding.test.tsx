import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Onboarding, isOnboardingDone, markOnboardingDone } from '../Onboarding'

function renderOnboarding(onComplete = () => {}) {
  return render(
    <MemoryRouter>
      <Onboarding onComplete={onComplete} />
    </MemoryRouter>,
  )
}

describe('Onboarding', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the first slide title', () => {
    renderOnboarding()
    expect(screen.getByText(/Welcome to Canasta/i)).toBeTruthy()
  })

  it('advances to next slide on Next click', async () => {
    const user = userEvent.setup()
    renderOnboarding()
    await user.click(screen.getByRole('button', { name: /Next/i }))
    expect(screen.getByText(/Learn the Rules/i)).toBeTruthy()
  })

  it('calls onComplete when Skip is clicked', async () => {
    const user = userEvent.setup()
    let completed = false
    renderOnboarding(() => { completed = true })
    await user.click(screen.getByRole('button', { name: /skip/i }))
    expect(completed).toBe(true)
  })

  it('marks onboarding done after Skip', async () => {
    const user = userEvent.setup()
    renderOnboarding()
    await user.click(screen.getByRole('button', { name: /skip/i }))
    expect(isOnboardingDone()).toBe(true)
  })

  it('isOnboardingDone returns false initially', () => {
    expect(isOnboardingDone()).toBe(false)
  })

  it('markOnboardingDone persists', () => {
    markOnboardingDone()
    expect(isOnboardingDone()).toBe(true)
  })
})

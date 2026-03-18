import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PracticeList } from '../../pages/PracticeList'
import { clearPracticeProgress, recordScenarioAttempt } from '../../game/practiceProgress'
import { SCENARIOS } from '../../game/scenarios'

function renderPracticeList() {
  return render(
    <MemoryRouter>
      <PracticeList />
    </MemoryRouter>,
  )
}

describe('PracticeList', () => {
  beforeEach(() => {
    clearPracticeProgress()
  })

  it('renders the Practice heading', () => {
    renderPracticeList()
    expect(screen.getByText('Practice')).toBeTruthy()
  })

  it('renders all 10 scenario titles', () => {
    renderPracticeList()
    for (const scen of SCENARIOS) {
      expect(screen.getByText(scen.title)).toBeTruthy()
    }
  })

  it('shows 0 of 10 drills passed when none are done', () => {
    renderPracticeList()
    expect(screen.getByText(/0 of 10 drills passed/i)).toBeTruthy()
  })

  it('shows progress when a drill is passed', () => {
    recordScenarioAttempt('initial-meld', true)
    renderPracticeList()
    expect(screen.getByText(/1 of 10 drills passed/i)).toBeTruthy()
  })

  it('shows passed badge on a completed drill', () => {
    recordScenarioAttempt('initial-meld', true)
    renderPracticeList()
    const badges = screen.getAllByLabelText('Passed')
    expect(badges.length).toBe(1)
  })

  it('shows attempted badge when drill was tried but not passed', () => {
    recordScenarioAttempt('initial-meld', false)
    renderPracticeList()
    const badges = screen.getAllByLabelText('Attempted')
    expect(badges.length).toBe(1)
  })

  it('links to each scenario drill', () => {
    renderPracticeList()
    const firstScen = SCENARIOS[0]
    const link = screen.getByRole('link', { name: new RegExp(firstScen.title, 'i') })
    expect(link.getAttribute('href')).toBe(`/practice/${firstScen.id}`)
  })

  it('shows a progress bar', () => {
    renderPracticeList()
    expect(screen.getByRole('progressbar')).toBeTruthy()
  })

  it('shows attempt count for attempted drills', () => {
    recordScenarioAttempt('initial-meld', false)
    renderPracticeList()
    expect(screen.getByText(/1 attempt/i)).toBeTruthy()
  })
})

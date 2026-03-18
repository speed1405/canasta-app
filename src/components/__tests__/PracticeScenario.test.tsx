import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PracticeScenario } from '../../pages/PracticeScenario'
import {
  clearPracticeProgress,
  getScenarioResult,
  recordScenarioAttempt,
} from '../../game/practiceProgress'
import { SCENARIOS } from '../../game/scenarios'

function renderScenario(scenId: string) {
  return render(
    <MemoryRouter initialEntries={[`/practice/${scenId}`]}>
      <Routes>
        <Route path="/practice/:scenId" element={<PracticeScenario />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PracticeScenario', () => {
  beforeEach(() => {
    clearPracticeProgress()
  })

  const firstScen = SCENARIOS[0]
  const lastScen = SCENARIOS[SCENARIOS.length - 1]

  it('renders the scenario title', () => {
    renderScenario(firstScen.id)
    expect(screen.getByText(firstScen.title)).toBeTruthy()
  })

  it('shows "Drill not found" for an unknown scenId', () => {
    renderScenario('unknown-scenario-xyz')
    expect(screen.getByText(/Drill not found/i)).toBeTruthy()
  })

  it('renders the scenario instructions', () => {
    renderScenario(firstScen.id)
    // Instructions contain partial text from the scenario
    expect(screen.getByText(/Scenario/i)).toBeTruthy()
  })

  it('renders the question', () => {
    renderScenario(firstScen.id)
    expect(screen.getByText(firstScen.question)).toBeTruthy()
  })

  it('renders all answer options as buttons', () => {
    renderScenario(firstScen.id)
    for (const opt of firstScen.options) {
      expect(screen.getByText(opt.text)).toBeTruthy()
    }
  })

  it('shows correct feedback when right option is selected', () => {
    renderScenario(firstScen.id)
    const correctText = firstScen.options[firstScen.correctIndex].text
    fireEvent.click(screen.getByText(correctText))
    expect(screen.getByText(/Correct!/i)).toBeTruthy()
  })

  it('shows incorrect feedback when wrong option is selected', () => {
    renderScenario(firstScen.id)
    const wrongIndex = firstScen.correctIndex === 0 ? 1 : 0
    fireEvent.click(screen.getByText(firstScen.options[wrongIndex].text))
    expect(screen.getByText(/Not quite/i)).toBeTruthy()
  })

  it('shows the explanation after answering', () => {
    renderScenario(firstScen.id)
    fireEvent.click(screen.getByText(firstScen.options[firstScen.correctIndex].text))
    expect(screen.getByText(firstScen.explanation)).toBeTruthy()
  })

  it('records a passing attempt in localStorage after correct answer', () => {
    renderScenario(firstScen.id)
    fireEvent.click(screen.getByText(firstScen.options[firstScen.correctIndex].text))
    const result = getScenarioResult(firstScen.id)
    expect(result?.passed).toBe(true)
    expect(result?.attempts).toBe(1)
  })

  it('records a failing attempt in localStorage after wrong answer', () => {
    renderScenario(firstScen.id)
    const wrongIndex = firstScen.correctIndex === 0 ? 1 : 0
    fireEvent.click(screen.getByText(firstScen.options[wrongIndex].text))
    const result = getScenarioResult(firstScen.id)
    expect(result?.passed).toBe(false)
    expect(result?.attempts).toBe(1)
  })

  it('shows Try again button after wrong answer', () => {
    renderScenario(firstScen.id)
    const wrongIndex = firstScen.correctIndex === 0 ? 1 : 0
    fireEvent.click(screen.getByText(firstScen.options[wrongIndex].text))
    expect(screen.getByRole('button', { name: /Try again/i })).toBeTruthy()
  })

  it('resets the answer state when Try again is clicked', () => {
    renderScenario(firstScen.id)
    const wrongIndex = firstScen.correctIndex === 0 ? 1 : 0
    fireEvent.click(screen.getByText(firstScen.options[wrongIndex].text))
    fireEvent.click(screen.getByRole('button', { name: /Try again/i }))
    // After reset, option buttons should be enabled again
    expect(screen.queryByText(/Not quite/i)).toBeNull()
    expect(screen.queryByRole('button', { name: /Try again/i })).toBeNull()
  })

  it('shows "Next drill" button after correct answer (not on last scenario)', () => {
    renderScenario(firstScen.id)
    fireEvent.click(screen.getByText(firstScen.options[firstScen.correctIndex].text))
    expect(screen.getByRole('button', { name: /Next drill/i })).toBeTruthy()
  })

  it('shows "All drills complete" link after answering last scenario correctly', () => {
    renderScenario(lastScen.id)
    fireEvent.click(screen.getByText(lastScen.options[lastScen.correctIndex].text))
    expect(screen.getByText(/All drills complete/i)).toBeTruthy()
  })

  it('shows already-passed badge if drill was previously passed', () => {
    recordScenarioAttempt(firstScen.id, true)
    renderScenario(firstScen.id)
    expect(screen.getByText(/You have already passed this drill/i)).toBeTruthy()
  })

  it('increments attempts on each try', () => {
    renderScenario(firstScen.id)
    const wrongIndex = firstScen.correctIndex === 0 ? 1 : 0
    // First attempt (wrong)
    fireEvent.click(screen.getByText(firstScen.options[wrongIndex].text))
    fireEvent.click(screen.getByRole('button', { name: /Try again/i }))
    // Second attempt (correct)
    fireEvent.click(screen.getByText(firstScen.options[firstScen.correctIndex].text))
    const result = getScenarioResult(firstScen.id)
    expect(result?.attempts).toBe(2)
    expect(result?.passed).toBe(true)
  })

  it('does not allow answering again after an answer is selected', () => {
    renderScenario(firstScen.id)
    fireEvent.click(screen.getByText(firstScen.options[firstScen.correctIndex].text))
    // All buttons should be disabled after answering
    const optionButtons = screen.getAllByRole('button', {
      name: new RegExp(firstScen.options[0].text.slice(0, 10), 'i'),
    })
    expect((optionButtons[0] as HTMLButtonElement).disabled).toBe(true)
  })
})

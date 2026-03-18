import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Stats } from '../../pages/Stats'
import { clearStats, recordGame, createGameRecord } from '../../game/stats'

function renderStats() {
  return render(
    <MemoryRouter>
      <Stats />
    </MemoryRouter>,
  )
}

describe('Stats', () => {
  beforeEach(() => {
    clearStats()
  })

  afterEach(() => {
    clearStats()
  })

  it('renders the Statistics heading', () => {
    renderStats()
    expect(screen.getByText('Statistics')).toBeTruthy()
  })

  it('shows zero games played when no history', () => {
    renderStats()
    expect(screen.getByText('Games played')).toBeTruthy()
    // The value should be 0
    const cards = screen.getAllByText('0')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('shows correct games played count', () => {
    recordGame(createGameRecord('2p', 'easy', 'human', { human: 1000, ai: 500 }, 2, 60000))
    recordGame(createGameRecord('2p', 'easy', 'ai', { human: 200, ai: 900 }, 1, 30000))
    renderStats()
    expect(screen.getByText('2')).toBeTruthy()
  })

  it('shows best score', () => {
    recordGame(createGameRecord('2p', 'easy', 'human', { human: 5500, ai: 1000 }, 3, 90000))
    renderStats()
    expect(screen.getByText('Best score')).toBeTruthy()
    const matches = screen.getAllByText('5,500')
    expect(matches.length).toBeGreaterThan(0)
  })

  it('shows no-games message when history is empty', () => {
    renderStats()
    expect(screen.getByText(/no games played yet/i)).toBeTruthy()
  })

  it('shows recent games table when history exists', () => {
    recordGame(createGameRecord('2p', 'easy', 'human', { human: 1000, ai: 500 }, 2, 60000))
    renderStats()
    const wins = screen.getAllByText('Win')
    expect(wins.length).toBeGreaterThan(0)
    const easyLabels = screen.getAllByText('easy')
    expect(easyLabels.length).toBeGreaterThan(0)
  })

  it('renders Download stats button', () => {
    renderStats()
    expect(screen.getByText(/download stats/i)).toBeTruthy()
  })

  it('renders Clear history button', () => {
    renderStats()
    expect(screen.getByText(/clear history/i)).toBeTruthy()
  })

  it('shows confirmation dialog when Clear history is clicked', () => {
    renderStats()
    const clearBtn = screen.getByText(/clear history/i)
    fireEvent.click(clearBtn)
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText(/clear all history/i)).toBeTruthy()
  })

  it('dismisses confirmation dialog on Cancel', () => {
    renderStats()
    fireEvent.click(screen.getByText(/clear history/i))
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('clears stats when confirmed', () => {
    recordGame(createGameRecord('2p', 'easy', 'human', { human: 1000, ai: 500 }, 2, 60000))
    renderStats()
    fireEvent.click(screen.getByText(/clear history/i))
    fireEvent.click(screen.getByText('Clear'))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByText(/no games played yet/i)).toBeTruthy()
  })

  it('shows win rate by difficulty bars', () => {
    renderStats()
    expect(screen.getByText(/win rate by difficulty/i)).toBeTruthy()
    // All 5 difficulties listed
    expect(screen.getByText('beginner')).toBeTruthy()
    expect(screen.getByText('expert')).toBeTruthy()
  })

  it('shows Loss for AI wins', () => {
    recordGame(createGameRecord('2p', 'easy', 'ai', { human: 200, ai: 900 }, 1, 30000))
    renderStats()
    expect(screen.getByText('Loss')).toBeTruthy()
  })
})

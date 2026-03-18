import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Card as CardType } from '../../game/types'
import { Card } from '../Card'

const king: CardType = { rank: 'K', suit: 'spades', id: 'K-spades-0' }
const joker: CardType = { rank: 'Joker', suit: null, id: 'Joker-null-0' }
const red3: CardType = { rank: '3', suit: 'hearts', id: '3-hearts-0' }
const black3: CardType = { rank: '3', suit: 'spades', id: '3-spades-0' }

describe('Card', () => {
  it('renders rank and suit symbol for a natural card', () => {
    render(<Card card={king} />)
    // K of spades should have ♠ symbol and K
    expect(screen.getAllByText('K').length).toBeGreaterThan(0)
    expect(screen.getAllByText('♠').length).toBeGreaterThan(0)
  })

  it('has accessible aria-label for natural card', () => {
    render(<Card card={king} />)
    const cardEl = document.querySelector('[aria-label]')
    expect(cardEl?.getAttribute('aria-label')).toMatch(/K of spades/)
  })

  it('renders JOKER text for joker card', () => {
    render(<Card card={joker} />)
    expect(screen.getByText('JOKER')).toBeTruthy()
  })

  it('renders face-down card with correct aria-label', () => {
    render(<Card card={king} faceDown />)
    expect(screen.getByLabelText('Card face down')).toBeTruthy()
  })

  it('renders selected card (no crash)', () => {
    render(<Card card={king} selected />)
    // Should render without error
    expect(document.querySelector('.ring-yellow-400')).toBeTruthy()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    let clicked = false
    render(<Card card={king} onClick={() => { clicked = true }} />)
    const el = screen.getByRole('button')
    await user.click(el)
    expect(clicked).toBe(true)
  })

  it('does not render as button when no onClick', () => {
    render(<Card card={king} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('renders red 3 without error', () => {
    render(<Card card={red3} />)
    expect(document.body).toBeTruthy()
  })

  it('renders black 3 without error', () => {
    render(<Card card={black3} />)
    expect(document.body).toBeTruthy()
  })
})

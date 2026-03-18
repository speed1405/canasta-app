import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Card as CardType } from '../../game/types'
import { Hand } from '../Hand'

const makeCard = (rank: CardType['rank'], idx = 0): CardType => ({
  rank,
  suit: 'spades',
  id: `${rank}-spades-${idx}`,
})

const HAND: CardType[] = [
  makeCard('K', 0),
  makeCard('Q', 1),
  makeCard('J', 2),
]

describe('Hand', () => {
  it('renders all cards', () => {
    render(<Hand cards={HAND} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('shows "No cards" when hand is empty', () => {
    render(<Hand cards={[]} />)
    expect(screen.getByText(/no cards/i)).toBeTruthy()
  })

  it('calls onCardClick when a card is clicked', async () => {
    const user = userEvent.setup()
    const clicked: CardType[] = []
    render(<Hand cards={HAND} onCardClick={(c) => clicked.push(c)} />)
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0])
    expect(clicked).toHaveLength(1)
  })

  it('renders selected cards with ring', () => {
    const selectedIds = new Set([HAND[0].id])
    render(<Hand cards={HAND} selectedIds={selectedIds} />)
    expect(document.querySelector('.ring-yellow-400')).toBeTruthy()
  })

  it('renders face-down cards when faceDown=true', () => {
    render(<Hand cards={HAND} faceDown />)
    const faceDownCards = screen.getAllByLabelText('Card face down')
    expect(faceDownCards).toHaveLength(3)
  })

  it('applies custom aria label', () => {
    render(<Hand cards={HAND} label="My Hand" />)
    expect(screen.getByRole('region', { name: 'My Hand' })).toBeTruthy()
  })

  it('disables interaction when disabled=true', () => {
    render(<Hand cards={HAND} onCardClick={() => {}} disabled />)
    expect(screen.queryByRole('button')).toBeNull()
  })
})

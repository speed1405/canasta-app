import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Reference } from '../../pages/Reference'

function renderReference() {
  return render(
    <MemoryRouter>
      <Reference />
    </MemoryRouter>,
  )
}

describe('Reference', () => {
  it('renders the Reference heading', () => {
    renderReference()
    expect(screen.getByText('Reference')).toBeTruthy()
  })

  it('renders a search input', () => {
    renderReference()
    expect(screen.getByRole('searchbox', { name: /search rules/i })).toBeTruthy()
  })

  it('renders all six rule sections by default', () => {
    renderReference()
    expect(screen.getByText('Initial Meld Requirements')).toBeTruthy()
    expect(screen.getByText('Card Point Values')).toBeTruthy()
    expect(screen.getByText('Canasta Bonuses')).toBeTruthy()
    expect(screen.getByText('End-of-Round Bonuses & Penalties')).toBeTruthy()
    expect(screen.getByText('Going-Out Conditions')).toBeTruthy()
    expect(screen.getByText('Variant Specifics')).toBeTruthy()
  })

  it('filters sections when searching', () => {
    renderReference()
    const search = screen.getByRole('searchbox')
    fireEvent.change(search, { target: { value: 'canasta' } })
    expect(screen.getByText('Canasta Bonuses')).toBeTruthy()
    expect(screen.queryByText('Card Point Values')).toBeNull()
  })

  it('shows no-results message for unknown query', () => {
    renderReference()
    const search = screen.getByRole('searchbox')
    fireEvent.change(search, { target: { value: 'xyzzy' } })
    expect(screen.getByText(/no results for/i)).toBeTruthy()
  })

  it('shows natural and mixed canasta bonuses', () => {
    renderReference()
    expect(screen.getByText('Natural canasta (no wilds)')).toBeTruthy()
    expect(screen.getByText('Mixed canasta (has wilds)')).toBeTruthy()
    // Check bonus values
    const fiveHundred = screen.getAllByText('500')
    expect(fiveHundred.length).toBeGreaterThan(0)
  })

  it('clears search and shows all sections again', () => {
    renderReference()
    const search = screen.getByRole('searchbox')
    fireEvent.change(search, { target: { value: 'canasta' } })
    fireEvent.change(search, { target: { value: '' } })
    expect(screen.getByText('Card Point Values')).toBeTruthy()
    expect(screen.getByText('Going-Out Conditions')).toBeTruthy()
  })

  it('shows the going-out conditions section', () => {
    renderReference()
    expect(screen.getByText(/one completed canasta/i)).toBeTruthy()
  })

  it('shows 2-player and 3-player deal sizes', () => {
    renderReference()
    expect(screen.getByText('2-Player')).toBeTruthy()
    expect(screen.getByText('3-Player')).toBeTruthy()
    expect(screen.getByText('15')).toBeTruthy()
    expect(screen.getByText('13')).toBeTruthy()
  })
})

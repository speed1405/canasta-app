import { describe, it, expect } from 'vitest'
import { createDeck, shuffle, dealHands, drawFromStock } from '../deck'

describe('createDeck', () => {
  it('creates 108 cards', () => {
    const deck = createDeck()
    expect(deck).toHaveLength(108)
  })

  it('contains 4 jokers', () => {
    const deck = createDeck()
    expect(deck.filter((c) => c.rank === 'Joker')).toHaveLength(4)
  })

  it('contains 8 aces', () => {
    const deck = createDeck()
    expect(deck.filter((c) => c.rank === 'A')).toHaveLength(8)
  })

  it('all cards have unique ids', () => {
    const deck = createDeck()
    const ids = new Set(deck.map((c) => c.id))
    expect(ids.size).toBe(108)
  })
})

describe('shuffle', () => {
  it('returns the same number of elements', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(shuffle(arr)).toHaveLength(5)
  })

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3]
    const original = [...arr]
    shuffle(arr)
    expect(arr).toEqual(original)
  })

  it('returns all original elements', () => {
    const deck = createDeck()
    const shuffled = shuffle(deck)
    expect(shuffled.map((c) => c.id).sort()).toEqual(
      deck.map((c) => c.id).sort(),
    )
  })
})

describe('dealHands', () => {
  it('deals 15 cards per player in 2-player variant', () => {
    const { hands } = dealHands('2p', 2)
    expect(hands).toHaveLength(2)
    hands.forEach((h) => expect(h).toHaveLength(15))
  })

  it('deals 13 cards per player in 3-player variant', () => {
    const { hands } = dealHands('3p', 3)
    expect(hands).toHaveLength(3)
    hands.forEach((h) => expect(h).toHaveLength(13))
  })

  it('leaves remaining cards in stock', () => {
    const { hands, stock } = dealHands('2p', 2)
    const totalDealt = hands.reduce((s, h) => s + h.length, 0)
    expect(totalDealt + stock.length).toBe(108)
  })

  it('all dealt cards are unique', () => {
    const { hands } = dealHands('2p', 2)
    const ids = hands.flat().map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('drawFromStock', () => {
  it('draws the requested number of cards', () => {
    const deck = createDeck()
    const { drawn, remaining } = drawFromStock(deck, 2)
    expect(drawn).toHaveLength(2)
    expect(remaining).toHaveLength(106)
  })

  it('returns empty drawn when count is 0', () => {
    const deck = createDeck()
    const { drawn, remaining } = drawFromStock(deck, 0)
    expect(drawn).toHaveLength(0)
    expect(remaining).toHaveLength(108)
  })

  it('does not mutate original stock', () => {
    const deck = createDeck()
    const len = deck.length
    drawFromStock(deck, 5)
    expect(deck).toHaveLength(len)
  })
})

import type { Card, Rank, Suit, Variant } from './types'
import { dealSize } from './types'

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS: Rank[] = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
]

/**
 * Build one standard 52-card deck plus 2 jokers (54 cards).
 */
function buildSingleDeck(deckIndex: number): Card[] {
  const cards: Card[] = []

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        rank,
        suit,
        id: `${rank}-${suit}-${deckIndex}`,
      })
    }
  }

  // 2 jokers per deck
  cards.push({ rank: 'Joker', suit: null, id: `Joker-red-${deckIndex}` })
  cards.push({ rank: 'Joker', suit: null, id: `Joker-black-${deckIndex}` })

  return cards
}

/**
 * Create the full 108-card Canasta deck (two standard decks + 4 jokers).
 */
export function createDeck(): Card[] {
  return [...buildSingleDeck(0), ...buildSingleDeck(1)]
}

/**
 * Fisher-Yates shuffle — returns a new shuffled array.
 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export interface DealResult {
  hands: Card[][]
  stock: Card[]
}

/**
 * Shuffle the deck and deal `numPlayers` hands of the size specified by the
 * variant (15 cards for 2-player, 13 cards for 3-player, 11 for 4-player partnership).
 */
export function dealHands(variant: Variant, numPlayers: number): DealResult {
  const handSize = dealSize(variant)
  const deck = shuffle(createDeck())

  const hands: Card[][] = []
  let idx = 0

  for (let p = 0; p < numPlayers; p++) {
    hands.push(deck.slice(idx, idx + handSize))
    idx += handSize
  }

  return {
    hands,
    stock: deck.slice(idx),
  }
}

/**
 * Draw `count` cards from the top of the stock.
 * Returns the drawn cards and the remaining stock.
 */
export function drawFromStock(
  stock: Card[],
  count: number,
): { drawn: Card[]; remaining: Card[] } {
  const drawn = stock.slice(0, count)
  const remaining = stock.slice(count)
  return { drawn, remaining }
}

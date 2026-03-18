import type { Card as CardType } from '../../game/types'
import { cardCategory, cardPointValue } from '../../game/types'

export interface CardProps {
  card: CardType
  selected?: boolean
  faceDown?: boolean
  onClick?: () => void
  className?: string
  disabled?: boolean
}

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

const SUIT_COLORS: Record<string, string> = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-slate-800',
  spades: 'text-slate-800',
}

function ariaLabel(card: CardType): string {
  if (card.rank === 'Joker') return 'Joker (wild card, 50 pts)'
  const suit = card.suit ?? ''
  const pts = cardPointValue(card)
  return `${card.rank} of ${suit} (${pts} pts)`
}

/**
 * Renders a single playing card.
 *
 * - Face-down cards show a simple pattern.
 * - Selected cards are highlighted with a ring.
 * - Accessible: aria-label describes rank, suit, and point value.
 * - Scales with viewport via responsive Tailwind classes.
 */
export function Card({ card, selected = false, faceDown = false, onClick, className = '', disabled = false }: CardProps) {
  const category = cardCategory(card)
  const suitSymbol = card.suit ? SUIT_SYMBOLS[card.suit] : ''
  const suitColor = card.suit ? SUIT_COLORS[card.suit] : 'text-slate-800'
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds'

  const isInteractive = !!onClick && !disabled

  const baseClasses = [
    'relative inline-flex flex-col justify-between',
    'w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28',
    'rounded-lg border border-slate-300',
    'font-bold text-xs sm:text-sm select-none',
    'transition-transform duration-150',
    faceDown ? 'bg-blue-800 border-blue-600' : 'bg-white',
    selected && !faceDown ? 'ring-2 ring-yellow-400 -translate-y-2 shadow-lg' : '',
    isInteractive ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md active:translate-y-0' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (faceDown) {
    return (
      <div
        className={baseClasses}
        aria-label="Card face down"
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onClick={isInteractive ? onClick : undefined}
        onKeyDown={
          isInteractive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onClick?.()
                }
              }
            : undefined
        }
      >
        <div className="absolute inset-1 rounded border border-blue-500 bg-blue-700 opacity-60" />
      </div>
    )
  }

  if (card.rank === 'Joker') {
    return (
      <div
        className={`${baseClasses} p-1`}
        aria-label={ariaLabel(card)}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onClick={isInteractive ? onClick : undefined}
        onKeyDown={
          isInteractive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onClick?.()
                }
              }
            : undefined
        }
      >
        <span className="text-purple-600 text-lg leading-none">🃏</span>
        <span className="text-center text-purple-600 font-extrabold text-xs">JOKER</span>
        <span className="self-end text-purple-600 text-lg leading-none rotate-180">🃏</span>
      </div>
    )
  }

  // Red 3 and Black 3 styling
  const isSpecial3 = card.rank === '3'
  const specialBg =
    isSpecial3 && category === 'red3'
      ? 'bg-red-50 border-red-300'
      : isSpecial3 && category === 'black3'
        ? 'bg-slate-100 border-slate-400'
        : ''

  return (
    <div
      className={`${baseClasses} ${specialBg} p-1`}
      aria-label={ariaLabel(card)}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
    >
      {/* Top-left rank + suit */}
      <div className={`flex flex-col items-start leading-none ${isRed ? 'text-red-600' : 'text-slate-800'}`}>
        <span className="font-extrabold">{card.rank}</span>
        <span>{suitSymbol}</span>
      </div>

      {/* Centre suit */}
      <div className={`absolute inset-0 flex items-center justify-center text-2xl ${suitColor} opacity-20 pointer-events-none`}>
        {suitSymbol}
      </div>

      {/* Bottom-right rank + suit (rotated) */}
      <div className={`flex flex-col items-end leading-none rotate-180 ${isRed ? 'text-red-600' : 'text-slate-800'}`}>
        <span className="font-extrabold">{card.rank}</span>
        <span>{suitSymbol}</span>
      </div>
    </div>
  )
}

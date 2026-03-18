import type { Card as CardType } from '../../game/types'
import { Card } from '../Card'

export interface HandProps {
  cards: CardType[]
  selectedIds?: Set<string>
  faceDown?: boolean
  onCardClick?: (card: CardType) => void
  label?: string
  className?: string
  disabled?: boolean
}

/**
 * Renders a player's hand of cards.
 *
 * - Horizontal scrollable fan layout.
 * - On small screens cards overlap slightly (fan); on larger screens they spread out.
 * - Tap/click to select (calls onCardClick).
 * - Accessible: labelled region with aria-label.
 */
export function Hand({
  cards,
  selectedIds = new Set(),
  faceDown = false,
  onCardClick,
  label = 'Hand',
  className = '',
  disabled = false,
}: HandProps) {
  return (
    <section
      aria-label={label}
      className={`relative w-full overflow-x-auto py-4 ${className}`}
    >
      <div
        className="flex flex-row gap-1 sm:gap-2 px-2 w-max"
        role="list"
        aria-label={`${label} cards`}
      >
        {cards.length === 0 && (
          <span className="text-slate-400 text-sm italic px-2">No cards</span>
        )}
        {cards.map((card) => (
          <div key={card.id} role="listitem">
            <Card
              card={card}
              selected={selectedIds.has(card.id)}
              faceDown={faceDown}
              onClick={onCardClick && !disabled ? () => onCardClick(card) : undefined}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

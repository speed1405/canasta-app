import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { GameBoard } from '../components/GameBoard'
import { useGameStore } from '../store/gameStore'
import type { AIDifficulty, Variant } from '../game/types'

export function PlayGame() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const startGame = useGameStore((s) => s.startGame)
  const gameState = useGameStore((s) => s.gameState)

  useEffect(() => {
    const variant = (searchParams.get('variant') ?? '2p') as Variant
    const difficulty = (searchParams.get('difficulty') ?? 'easy') as AIDifficulty
    startGame(variant, difficulty)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  if (!gameState) {
    return <div className="flex items-center justify-center h-screen">Loading…</div>
  }

  return <GameBoard onExit={() => navigate('/play')} />
}

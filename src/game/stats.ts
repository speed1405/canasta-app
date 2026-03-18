import type { GameRecord, PlayerStats, AIDifficulty, Variant } from './types'

const STATS_KEY = 'canasta_stats'
const MAX_HISTORY = 100

// ─── Load / Save ─────────────────────────────────────────────────────────────

function defaultStats(): PlayerStats {
  return { gamesPlayed: 0, wins: 0, losses: 0, bestScore: 0, history: [] }
}

export function loadStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return defaultStats()
    const parsed = JSON.parse(raw) as PlayerStats
    return parsed
  } catch {
    return defaultStats()
  }
}

export function saveStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {
    // localStorage unavailable (e.g. private browsing quota exceeded) — silently ignore
  }
}

// ─── Record a completed game ──────────────────────────────────────────────────

export function recordGame(record: GameRecord): PlayerStats {
  const stats = loadStats()

  stats.gamesPlayed++
  if (record.winner === 'human') {
    stats.wins++
  } else {
    stats.losses++
  }

  const humanScore = record.scores['human'] ?? 0
  if (humanScore > stats.bestScore) {
    stats.bestScore = humanScore
  }

  stats.history = [record, ...stats.history].slice(0, MAX_HISTORY)

  saveStats(stats)
  return stats
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function winRate(stats: PlayerStats): number {
  if (stats.gamesPlayed === 0) return 0
  return stats.wins / stats.gamesPlayed
}

export function winRateByDifficulty(
  stats: PlayerStats,
  difficulty: AIDifficulty,
): number {
  const games = stats.history.filter((g) => g.difficulty === difficulty)
  if (games.length === 0) return 0
  const wins = games.filter((g) => g.winner === 'human').length
  return wins / games.length
}

export function averageScore(stats: PlayerStats): number {
  if (stats.history.length === 0) return 0
  const total = stats.history.reduce(
    (sum, g) => sum + (g.scores['human'] ?? 0),
    0,
  )
  return total / stats.history.length
}

export function longestWinStreak(stats: PlayerStats): number {
  let max = 0
  let current = 0
  // history is most-recent-first; reverse for chronological order
  const sorted = [...stats.history].reverse()
  for (const g of sorted) {
    if (g.winner === 'human') {
      current++
      max = Math.max(max, current)
    } else {
      current = 0
    }
  }
  return max
}

export function recentGames(stats: PlayerStats, count = 20): GameRecord[] {
  return stats.history.slice(0, count)
}

export function clearStats(): void {
  localStorage.removeItem(STATS_KEY)
}

export function exportStats(stats: PlayerStats): string {
  return JSON.stringify(stats, null, 2)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function createGameRecord(
  variant: Variant,
  difficulty: AIDifficulty,
  winner: 'human' | 'ai',
  scores: Record<string, number>,
  rounds: number,
  durationMs: number,
): GameRecord {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: new Date().toISOString(),
    variant,
    difficulty,
    winner,
    scores,
    rounds,
    durationMs,
  }
}

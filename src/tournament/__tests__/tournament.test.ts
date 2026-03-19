import { describe, it, expect } from 'vitest'
import type { Tournament, TournamentPlayer, TournamentMatch } from '../types'

function makePlayer(uid: string, seed: number): TournamentPlayer {
  return { uid, displayName: `Player ${uid}`, elo: 1200, points: 0, wins: 0, losses: 0, seed }
}

function makeMatch(id: string, p1: string, p2: string, round = 1): TournamentMatch {
  return {
    id,
    round,
    player1Uid: p1,
    player2Uid: p2,
    player1Score: 0,
    player2Score: 0,
    winnerUid: null,
    status: 'pending',
    finishedAt: null,
  }
}

describe('Tournament data model', () => {
  it('can create a valid tournament object', () => {
    const t: Tournament = {
      id: 'test-id',
      name: 'Test Tournament',
      variant: '2p',
      format: 'round-robin',
      status: 'registering',
      maxPlayers: 4,
      players: [],
      matches: [],
      rounds: 0,
      createdBy: 'uid-1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    expect(t.format).toBe('round-robin')
    expect(t.status).toBe('registering')
    expect(t.players).toHaveLength(0)
  })

  it('can add players to a tournament', () => {
    const players = [
      makePlayer('a', 1),
      makePlayer('b', 2),
      makePlayer('c', 3),
    ]
    expect(players).toHaveLength(3)
    expect(players[0].seed).toBe(1)
    expect(players[2].uid).toBe('c')
  })

  it('can represent a finished match', () => {
    const match: TournamentMatch = {
      ...makeMatch('m1', 'a', 'b'),
      winnerUid: 'a',
      player1Score: 5000,
      player2Score: 3000,
      status: 'finished',
      finishedAt: new Date().toISOString(),
    }
    expect(match.status).toBe('finished')
    expect(match.winnerUid).toBe('a')
  })

  it('supports both formats', () => {
    const formats = ['round-robin', 'single-elimination'] as const
    formats.forEach(f => {
      const t: Tournament = {
        id: f,
        name: f,
        variant: '2p',
        format: f,
        status: 'registering',
        maxPlayers: 4,
        players: [],
        matches: [],
        rounds: 0,
        createdBy: 'uid',
        createdAt: 0,
        updatedAt: 0,
      }
      expect(t.format).toBe(f)
    })
  })
})

import { describe, it, expect } from 'vitest'
import { createReplay } from '../replayService'

describe('replayService', () => {
  describe('createReplay', () => {
    it('creates a replay with a unique id', () => {
      const r1 = createReplay({ ownerUid: 'u1', playerNames: ['Alice', 'Bob'], variant: '2p' })
      const r2 = createReplay({ ownerUid: 'u1', playerNames: ['Alice', 'Bob'], variant: '2p' })
      expect(r1.id).not.toBe(r2.id)
    })

    it('sets ownerUid correctly', () => {
      const r = createReplay({ ownerUid: 'user-123', playerNames: ['Alice'], variant: '2p' })
      expect(r.ownerUid).toBe('user-123')
    })

    it('starts with no actions', () => {
      const r = createReplay({ ownerUid: null, playerNames: ['Alice', 'Bob'], variant: '2p' })
      expect(r.actions).toHaveLength(0)
    })

    it('defaults isPublic to false', () => {
      const r = createReplay({ ownerUid: null, playerNames: ['Alice'], variant: '2p' })
      expect(r.isPublic).toBe(false)
    })

    it('stores player names', () => {
      const names = ['Alice', 'Bob', 'Charlie']
      const r = createReplay({ ownerUid: null, playerNames: names, variant: '3p' })
      expect(r.playerNames).toEqual(names)
    })

    it('stores variant', () => {
      const r = createReplay({ ownerUid: null, playerNames: ['Alice', 'Bob'], variant: '2p' })
      expect(r.variant).toBe('2p')
    })
  })
})

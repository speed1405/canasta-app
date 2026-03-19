/** Types for the Friends (social) system. */

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined'

export interface FriendRequest {
  /** Unique document ID (Firestore). */
  id: string
  /** UID of the user who sent the request. */
  fromUid: string
  fromDisplayName: string
  /** UID of the user who received the request. */
  toUid: string
  toDisplayName: string
  status: FriendRequestStatus
  createdAt: number
  updatedAt: number
}

export type OnlineStatus = 'online' | 'in-game' | 'offline'

export interface Friend {
  /** UID of the friend. */
  uid: string
  displayName: string
  status: OnlineStatus
  lastSeen: number
}

export interface FriendProfile {
  uid: string
  displayName: string
  status: OnlineStatus
  lastSeen: number
}

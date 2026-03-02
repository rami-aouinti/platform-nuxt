export type FriendUser = {
  id: string
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  photo?: string | null
}

export type FriendRequest = {
  id: string
  user?: FriendUser | null
  fromUser?: FriendUser | null
  toUser?: FriendUser | null
  createdAt?: string | null
}

type CollectionResponse<T> = T[] | { data?: T[]; items?: T[]; results?: T[] }

const basePath = '/api/v1/me/friends'

function normalizeCollection<T>(payload: CollectionResponse<T>): T[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.results)) return payload.results
  return []
}

function normalizeFriendUser(raw: Record<string, unknown>): FriendUser {
  return {
    id: String(raw.id ?? raw.userId ?? ''),
    username: typeof raw.username === 'string' ? raw.username : null,
    firstName: typeof raw.firstName === 'string' ? raw.firstName : null,
    lastName: typeof raw.lastName === 'string' ? raw.lastName : null,
    email: typeof raw.email === 'string' ? raw.email : null,
    photo: typeof raw.photo === 'string' ? raw.photo : null,
  }
}

function normalizeFriendRequest(raw: Record<string, unknown>): FriendRequest {
  const user = raw.user && typeof raw.user === 'object'
    ? normalizeFriendUser(raw.user as Record<string, unknown>)
    : null

  const fromUser = raw.fromUser && typeof raw.fromUser === 'object'
    ? normalizeFriendUser(raw.fromUser as Record<string, unknown>)
    : null

  const toUser = raw.toUser && typeof raw.toUser === 'object'
    ? normalizeFriendUser(raw.toUser as Record<string, unknown>)
    : null

  return {
    id: String(raw.id ?? raw.requestId ?? ''),
    user,
    fromUser,
    toUser,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : null,
  }
}

export function useFriendsApi() {
  return {
    async listFriends(): Promise<FriendUser[]> {
      const response = await $fetch<CollectionResponse<Record<string, unknown>>>(basePath, {
        method: 'GET',
      })

      return normalizeCollection(response)
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
        .map((item) => normalizeFriendUser(item))
        .filter((item) => Boolean(item.id))
    },

    async listSentRequests(): Promise<FriendRequest[]> {
      const response = await $fetch<CollectionResponse<Record<string, unknown>>>(`${basePath}/requests/sent`, {
        method: 'GET',
      })

      return normalizeCollection(response)
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
        .map((item) => normalizeFriendRequest(item))
        .filter((item) => Boolean(item.id))
    },

    async listReceivedRequests(): Promise<FriendRequest[]> {
      const response = await $fetch<CollectionResponse<Record<string, unknown>>>(`${basePath}/requests/received`, {
        method: 'GET',
      })

      return normalizeCollection(response)
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
        .map((item) => normalizeFriendRequest(item))
        .filter((item) => Boolean(item.id))
    },

    async sendFriendRequest(userId: string): Promise<FriendRequest> {
      const response = await $fetch<Record<string, unknown>>(`${basePath}/requests/${userId}`, {
        method: 'POST',
      })

      return normalizeFriendRequest(response)
    },

    async acceptFriendRequest(requestId: string): Promise<FriendRequest> {
      const response = await $fetch<Record<string, unknown>>(`${basePath}/requests/${requestId}/accept`, {
        method: 'POST',
      })

      return normalizeFriendRequest(response)
    },

    async deleteFriend(userId: string): Promise<void> {
      await $fetch(`${basePath}/${userId}`, {
        method: 'DELETE',
      })
    },
  }
}

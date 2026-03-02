export type UsersListQuery = {
  limit?: number
  offset?: number
  order?: string
  search?: string
}

export type CreateUserPayload = {
  username: string
  email: string
  firstName?: string
  lastName?: string
  password: string
}

const USERS_ENDPOINT = '/api/v1/admin/users'

export const usersService = {
  list(query: UsersListQuery = {}) {
    return $fetch(USERS_ENDPOINT, { query })
  },
  count() {
    return $fetch(`${USERS_ENDPOINT}/count`)
  },
  async ids() {
    try {
      return await $fetch(`${USERS_ENDPOINT}/ids`)
    } catch {
      return []
    }
  },
  patch(userId: string, body: Record<string, unknown>) {
    return $fetch(`${USERS_ENDPOINT}/${encodeURIComponent(userId)}`, {
      method: 'PATCH' as any,
      body,
    })
  },
  remove(userId: string) {
    return $fetch(`${USERS_ENDPOINT}/${encodeURIComponent(userId)}`, {
      method: 'DELETE' as any,
    })
  },
  create(body: CreateUserPayload) {
    return $fetch(USERS_ENDPOINT, {
      method: 'POST' as any,
      body,
    })
  },
}

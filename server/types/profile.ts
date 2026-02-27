export type RoleCandidate = string | { id?: unknown } | null | undefined

export type GroupCandidate = {
  id?: unknown
  role?: {
    id?: unknown
  }
  name?: unknown
  [key: string]: unknown
}

export type NormalizedAuthProfile = {
  id: string | number
  username: string
  firstName: string
  lastName: string
  email: string
  language?: string
  locale?: string
  timezone?: string
  roles: string[]
  [key: string]: unknown
}

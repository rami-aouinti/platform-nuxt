export type AuthRole = string

export type AuthGroup = {
  id: string | number
  role: {
    id: string
  }
  name: string
}

export type AuthProfile = {
  id: string | number
  username: string
  firstName: string
  lastName: string
  email: string
  language?: string
  locale?: string
  timezone?: string
  roles?: AuthRole[]
  [key: string]: unknown
}

export type StoredAuthState = {
  token: string
  profile: AuthProfile | null
  groups: AuthGroup[]
  roles: AuthRole[]
  cachedAt: number
}

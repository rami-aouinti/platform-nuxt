import type { StoredAuthState } from '~/types/auth'

export const AUTH_TOKEN_STORAGE_KEY = 'auth_token'
export const AUTH_TOKEN_COOKIE_KEY = 'auth_token'
export const AUTH_PRIMARY_ROLE_STORAGE_KEY = 'auth_primary_role'
export const AUTH_STATE_STORAGE_KEY = 'auth_state'
export const AUTH_STATE_MAX_AGE_MS = 5 * 60 * 1000

function canUseSessionStorage() {
  return typeof sessionStorage !== 'undefined'
}

export function clearPersistedAuthState() {
  if (!canUseSessionStorage()) {
    return
  }

  sessionStorage.removeItem(AUTH_STATE_STORAGE_KEY)
}

export function persistAuthState(authState: StoredAuthState | null) {
  if (!canUseSessionStorage()) {
    return
  }

  if (!authState) {
    clearPersistedAuthState()
    return
  }

  sessionStorage.setItem(AUTH_STATE_STORAGE_KEY, JSON.stringify(authState))
}

export function readCachedAuthState(
  activeToken: string | null,
): StoredAuthState | null {
  if (!canUseSessionStorage() || !activeToken) {
    return null
  }

  const rawState = sessionStorage.getItem(AUTH_STATE_STORAGE_KEY)

  if (!rawState) {
    return null
  }

  try {
    const parsed = JSON.parse(rawState) as StoredAuthState
    const isExpired = Date.now() - parsed.cachedAt > AUTH_STATE_MAX_AGE_MS
    const hasMatchingToken = parsed.token === activeToken

    if (isExpired || !hasMatchingToken) {
      clearPersistedAuthState()
      return null
    }

    return parsed
  } catch {
    clearPersistedAuthState()
    return null
  }
}

export function persistToken(token: string | null) {
  if (!canUseSessionStorage()) {
    return
  }

  if (!token) {
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  }
}

function readPersistedTokenFromCookie(): string | null {
  const tokenCookie = useCookie<string | null>(AUTH_TOKEN_COOKIE_KEY)

  if (!tokenCookie.value) {
    return null
  }

  return decodeURIComponent(tokenCookie.value ?? '') || null
}

export function readPersistedToken(): string | null {
  // Compat temporaire: accepter l'ancien stockage client le temps de la migration.
  if (canUseSessionStorage()) {
    const sessionToken = sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

    if (sessionToken) {
      return sessionToken
    }
  }

  return readPersistedTokenFromCookie()
}

export function persistPrimaryRole(role: string | null) {
  if (!canUseSessionStorage()) {
    return
  }

  if (role) {
    sessionStorage.setItem(AUTH_PRIMARY_ROLE_STORAGE_KEY, role)
    return
  }

  sessionStorage.removeItem(AUTH_PRIMARY_ROLE_STORAGE_KEY)
}

export function readPersistedPrimaryRole() {
  if (!canUseSessionStorage()) {
    return null
  }

  return sessionStorage.getItem(AUTH_PRIMARY_ROLE_STORAGE_KEY)
}

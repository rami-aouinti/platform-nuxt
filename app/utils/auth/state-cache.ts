import type { StoredAuthState } from '~/types/auth'

export const AUTH_TOKEN_STORAGE_KEY = 'auth_token'
export const AUTH_TOKEN_COOKIE_KEY = 'auth_token'
export const AUTH_STATE_STORAGE_KEY = 'auth_state'
export const AUTH_STATE_MAX_AGE_MS = 5 * 60 * 1000

function canUseSessionStorage() {
  return typeof sessionStorage !== 'undefined'
}

function canUseDocumentCookie() {
  return typeof document !== 'undefined'
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

export function readCachedAuthState(activeToken: string | null): StoredAuthState | null {
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
  }
  catch {
    clearPersistedAuthState()
    return null
  }
}

export function persistToken(token: string | null) {
  if (!canUseSessionStorage() || !canUseDocumentCookie()) {
    return
  }

  if (token) {
    sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    document.cookie = `${AUTH_TOKEN_COOKIE_KEY}=${encodeURIComponent(token)}; Path=/; SameSite=Lax`
    return
  }

  sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  document.cookie = `${AUTH_TOKEN_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`
}

export function readPersistedToken() {
  if (!canUseSessionStorage()) {
    return null
  }

  return sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

export type SessionCachePayload<T> = {
  cachedAt: number
  data: T
}

function canUseSessionStorage() {
  return typeof sessionStorage !== 'undefined'
}

export function readSessionCache<T>(key: string, maxAgeMs: number): T | null {
  if (!canUseSessionStorage()) {
    return null
  }

  const rawValue = sessionStorage.getItem(key)

  if (!rawValue) {
    return null
  }

  try {
    const payload = JSON.parse(rawValue) as SessionCachePayload<T>

    if (!payload || typeof payload.cachedAt !== 'number') {
      sessionStorage.removeItem(key)
      return null
    }

    const isExpired = Date.now() - payload.cachedAt > maxAgeMs

    if (isExpired) {
      sessionStorage.removeItem(key)
      return null
    }

    return payload.data
  }
  catch {
    sessionStorage.removeItem(key)
    return null
  }
}

export function writeSessionCache<T>(key: string, data: T) {
  if (!canUseSessionStorage()) {
    return
  }

  const payload: SessionCachePayload<T> = {
    cachedAt: Date.now(),
    data,
  }

  sessionStorage.setItem(key, JSON.stringify(payload))
}

export function clearSessionCache(key: string) {
  if (!canUseSessionStorage()) {
    return
  }

  sessionStorage.removeItem(key)
}

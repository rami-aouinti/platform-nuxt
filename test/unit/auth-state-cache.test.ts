import { describe, expect, it, vi } from 'vitest'
import {
  clearPersistedAuthState,
  persistAuthState,
  persistToken,
  readCachedAuthState,
  readPersistedToken,
} from '../../app/utils/auth/state-cache'

describe('auth state cache utils', () => {
  it('persists and reads auth state', () => {
    const setItem = vi.fn()
    const getItem = vi.fn(() => JSON.stringify({
      token: 'token-1',
      profile: { id: '1', username: 'john', firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
      groups: [],
      roles: ['ROLE_USER'],
      cachedAt: Date.now(),
    }))
    const removeItem = vi.fn()

    vi.stubGlobal('sessionStorage', { setItem, getItem, removeItem })

    persistAuthState({
      token: 'token-1',
      profile: { id: '1', username: 'john', firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
      groups: [],
      roles: ['ROLE_USER'],
      cachedAt: Date.now(),
    })

    expect(setItem).toHaveBeenCalledOnce()
    expect(readCachedAuthState('token-1')?.roles).toEqual(['ROLE_USER'])

    clearPersistedAuthState()
    expect(removeItem).toHaveBeenCalledOnce()
  })

  it('writes token to session storage and reads it back with priority over cookie', () => {
    const setItem = vi.fn()
    const getItem = vi.fn((key: string) => {
      if (key === 'auth_token') {
        return 'cookie-session-marker'
      }

      return null
    })
    const removeItem = vi.fn()

    vi.stubGlobal('sessionStorage', { setItem, getItem, removeItem })
    vi.stubGlobal('useCookie', vi.fn(() => ({ value: 'cookie%2Dtoken' })))

    persistToken('cookie-session-marker')

    expect(setItem).toHaveBeenCalledWith('auth_token', 'cookie-session-marker')
    expect(readPersistedToken()).toBe('cookie-session-marker')
  })
})

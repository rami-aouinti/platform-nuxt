import { describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'

import {
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../server/utils/profile-endpoint-cache'

describe('profile-endpoint-cache', () => {
  it('stores and reads cache values by authorization header', () => {
    vi.stubGlobal('getHeader', vi.fn(() => 'Bearer token-a'))
    vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({ profileEndpointCacheTtlMs: 1000 })))

    const event = {} as H3Event
    writeProfileEndpointCache(event, 'profile', { id: '1' })

    expect(readProfileEndpointCache(event, 'profile')).toEqual({ id: '1' })
  })

  it('expires cache values after ttl', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('getHeader', vi.fn(() => 'Bearer token-b'))
    vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({ profileEndpointCacheTtlMs: 10 })))

    const event = {} as H3Event
    writeProfileEndpointCache(event, 'roles', ['ROLE_USER'])

    await vi.advanceTimersByTimeAsync(11)

    expect(readProfileEndpointCache(event, 'roles')).toBeNull()
    vi.useRealTimers()
  })
})

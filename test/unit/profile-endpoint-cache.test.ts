import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'

const cacheMocks = vi.hoisted(() => ({
  buildProfileCacheKey: vi.fn(
    (_event: H3Event, key: string) => `profile:hash:${key}`,
  ),
  getProfileCache: vi.fn(),
  setProfileCache: vi.fn(),
}))

vi.mock('../../server/utils/cache/profile-cache', () => ({
  buildProfileCacheKey: cacheMocks.buildProfileCacheKey,
  getProfileCache: cacheMocks.getProfileCache,
  setProfileCache: cacheMocks.setProfileCache,
}))

import {
  readProfileEndpointCache,
  writeProfileEndpointCache,
} from '../../server/utils/profile-endpoint-cache'

describe('profile-endpoint-cache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reads cache values via redis wrapper key', async () => {
    vi.stubGlobal(
      'useRuntimeConfig',
      vi.fn(() => ({ profileEndpointCacheTtlMs: 1000 })),
    )
    const event = {} as H3Event

    cacheMocks.getProfileCache.mockResolvedValue({ id: '1' })

    await expect(readProfileEndpointCache(event, 'profile')).resolves.toEqual({
      id: '1',
    })
    expect(cacheMocks.buildProfileCacheKey).toHaveBeenCalledWith(
      event,
      'profile',
    )
    expect(cacheMocks.getProfileCache).toHaveBeenCalledWith(
      event,
      'profile:hash:profile',
    )
  })

  it('writes cache values with ttl from runtime config', async () => {
    vi.stubGlobal(
      'useRuntimeConfig',
      vi.fn(() => ({ profileEndpointCacheTtlMs: 10 })),
    )
    const event = {} as H3Event

    await writeProfileEndpointCache(event, 'roles', ['ROLE_USER'])

    expect(cacheMocks.buildProfileCacheKey).toHaveBeenCalledWith(event, 'roles')
    expect(cacheMocks.setProfileCache).toHaveBeenCalledWith(
      event,
      'profile:hash:roles',
      ['ROLE_USER'],
      10,
    )
  })
})

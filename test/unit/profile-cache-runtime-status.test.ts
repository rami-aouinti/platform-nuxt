import { describe, expect, it } from 'vitest'

import { resolveProfileCacheRuntimeStatus } from '../../server/utils/cache/profile-cache'

describe('resolveProfileCacheRuntimeStatus', () => {
  it('enables cache in redis url mode when ttl is valid', () => {
    expect(
      resolveProfileCacheRuntimeStatus({
        profileEndpointCacheTtlMs: 30_000,
        redisUrl: 'redis://localhost:6379/0',
      }),
    ).toEqual({
      enabled: true,
      mode: 'url',
      ttlMs: 30_000,
      fallbackBehavior: 'no-cache',
    })
  })

  it('enables cache in host-port mode when url is absent', () => {
    expect(
      resolveProfileCacheRuntimeStatus({
        profileEndpointCacheTtlMs: '15000',
        redisHost: 'localhost',
      }),
    ).toEqual({
      enabled: true,
      mode: 'host-port',
      ttlMs: 15_000,
      fallbackBehavior: 'no-cache',
    })
  })

  it('disables cache when ttl is invalid', () => {
    expect(
      resolveProfileCacheRuntimeStatus({
        profileEndpointCacheTtlMs: 0,
        redisUrl: 'redis://localhost:6379/0',
      }),
    ).toMatchObject({
      enabled: false,
      mode: 'disabled',
      reason: 'ttl_non_positive_or_invalid',
    })
  })

  it('disables cache when redis connection config is missing', () => {
    expect(
      resolveProfileCacheRuntimeStatus({
        profileEndpointCacheTtlMs: 30_000,
      }),
    ).toMatchObject({
      enabled: false,
      mode: 'disabled',
      reason: 'missing_redis_connection',
    })
  })
})

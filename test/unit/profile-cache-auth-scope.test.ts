import { createHash } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'

const authorizationMocks = vi.hoisted(() => ({
  resolveAuthorizationHeader: vi.fn(),
}))

vi.mock('../../server/utils/authorization', () => ({
  resolveAuthorizationHeader: authorizationMocks.resolveAuthorizationHeader,
}))

// eslint-disable-next-line import/first
import { buildProfileCacheKey } from '../../server/utils/cache/profile-cache'

describe('profile-cache auth scoping', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('getHeader', vi.fn(() => undefined))
  })

  it('uses resolved authorization header for cache auth hash', () => {
    authorizationMocks.resolveAuthorizationHeader.mockReturnValue('Bearer cookie-session-token')

    const cacheKey = buildProfileCacheKey({} as H3Event, 'profile-groups')
    const expectedHash = createHash('sha256').update('Bearer cookie-session-token').digest('hex')

    expect(authorizationMocks.resolveAuthorizationHeader).toHaveBeenCalledTimes(1)
    expect(cacheKey).toContain(`auth:${expectedHash}`)
    expect(cacheKey).toContain('resource:profile-groups')
  })
})

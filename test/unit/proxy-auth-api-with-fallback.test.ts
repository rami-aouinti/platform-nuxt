import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'
import { createError } from 'h3'
import { proxyAuthApiWithPathFallback } from '../../server/utils/proxy-auth-api-with-fallback'
import { proxyAuthApiRequest } from '../../server/utils/auth-api-proxy'

vi.mock('../../server/utils/auth-api-proxy', () => ({
  proxyAuthApiRequest: vi.fn(),
}))

describe('proxyAuthApiWithPathFallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses fallback path when the first path returns 404', async () => {
    vi.mocked(proxyAuthApiRequest)
      .mockRejectedValueOnce(createError({ statusCode: 404, statusMessage: 'Not Found' }))
      .mockResolvedValueOnce({ roles: ['ROLE_USER'] })

    const event = {} as H3Event

    const response = await proxyAuthApiWithPathFallback(
      event,
      ['/api/v1/me/profile/roles', '/api/v1/profile/roles'],
      'GET',
    )

    expect(response).toEqual({ roles: ['ROLE_USER'] })
    expect(proxyAuthApiRequest).toHaveBeenNthCalledWith(1, event, '/api/v1/me/profile/roles', 'GET')
    expect(proxyAuthApiRequest).toHaveBeenNthCalledWith(2, event, '/api/v1/profile/roles', 'GET')
  })

  it('stops retrying for non-404 errors', async () => {
    const forbiddenError = createError({ statusCode: 403, statusMessage: 'Forbidden' })
    vi.mocked(proxyAuthApiRequest).mockRejectedValueOnce(forbiddenError)

    const event = {} as H3Event

    await expect(
      proxyAuthApiWithPathFallback(
        event,
        ['/api/v1/me/profile/roles', '/api/v1/profile/roles'],
        'GET',
      ),
    ).rejects.toBe(forbiddenError)

    expect(proxyAuthApiRequest).toHaveBeenCalledTimes(1)
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'
import { createError } from 'h3'
import { proxyAuthApiCanonical } from '../../server/utils/canonical-endpoint-resolver'
import { proxyAuthApiRequest } from '../../server/utils/auth-api-proxy'

vi.mock('../../server/utils/auth-api-proxy', () => ({
  proxyAuthApiRequest: vi.fn(),
}))

describe('proxyAuthApiCanonical', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses canonical endpoint when available', async () => {
    vi.mocked(proxyAuthApiRequest).mockResolvedValueOnce({ id: 1 })
    const event = {} as H3Event

    const response = await proxyAuthApiCanonical(event, 'profile', 'GET')

    expect(response).toEqual({ id: 1 })
    expect(proxyAuthApiRequest).toHaveBeenCalledTimes(1)
    expect(proxyAuthApiRequest).toHaveBeenCalledWith(event, '/api/v1/me/profile', 'GET')
  })

  it('falls back to legacy alias and logs deprecation warning on canonical 404', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.mocked(proxyAuthApiRequest)
      .mockRejectedValueOnce(createError({ statusCode: 404, statusMessage: 'Not Found' }))
      .mockResolvedValueOnce({ id: 2 })

    const event = {} as H3Event
    const response = await proxyAuthApiCanonical(event, 'profile', 'GET')

    expect(response).toEqual({ id: 2 })
    expect(proxyAuthApiRequest).toHaveBeenNthCalledWith(1, event, '/api/v1/me/profile', 'GET')
    expect(proxyAuthApiRequest).toHaveBeenNthCalledWith(2, event, '/api/v1/profile', 'GET')
    expect(console.warn).toHaveBeenCalledTimes(1)
  })

  it('falls back to legacy alias for profile groups when canonical endpoint returns 401', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.mocked(proxyAuthApiRequest)
      .mockRejectedValueOnce(createError({ statusCode: 401, statusMessage: 'Unauthorized' }))
      .mockResolvedValueOnce([{ id: 'group-1' }])

    const event = {} as H3Event
    const response = await proxyAuthApiCanonical(event, 'profileGroups', 'GET')

    expect(response).toEqual([{ id: 'group-1' }])
    expect(proxyAuthApiRequest).toHaveBeenNthCalledWith(1, event, '/api/v1/me/profile/groups', 'GET')
    expect(proxyAuthApiRequest).toHaveBeenNthCalledWith(2, event, '/api/v1/profile/groups', 'GET')
    expect(console.warn).toHaveBeenCalledTimes(1)
  })

  it('does not fallback on 401 for profile root endpoint', async () => {
    vi.mocked(proxyAuthApiRequest)
      .mockRejectedValueOnce(createError({ statusCode: 401, statusMessage: 'Unauthorized' }))

    const event = {} as H3Event

    await expect(proxyAuthApiCanonical(event, 'profile', 'GET')).rejects.toMatchObject({
      statusCode: 401,
    })

    expect(proxyAuthApiRequest).toHaveBeenCalledTimes(1)
    expect(proxyAuthApiRequest).toHaveBeenNthCalledWith(1, event, '/api/v1/me/profile', 'GET')
  })
})

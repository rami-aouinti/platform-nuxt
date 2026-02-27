import { describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'
import {
  createProxyCollectionHandler,
  createProxyEntityHandler,
  validateRequiredRouteParam,
} from '../../server/utils/proxy-handler-factory'
import { proxyAuthApiGet, proxyAuthApiRequest } from '../../server/utils/auth-api-proxy'

vi.mock('../../server/utils/auth-api-proxy', () => ({
  proxyAuthApiGet: vi.fn(),
  proxyAuthApiRequest: vi.fn(),
}))

describe('proxy-handler-factory', () => {
  it('validates missing route params with standardized defaults', () => {
    const event = { context: { params: {} } } as unknown as H3Event

    expect(() => validateRequiredRouteParam(event, 'id')).toThrowErrorMatchingInlineSnapshot(`
      [Error: Route parameter "id" is required.]
    `)

    try {
      validateRequiredRouteParam(event, 'id')
    }
    catch (error) {
      expect(error).toMatchObject({
        statusCode: 400,
        statusMessage: 'Invalid id parameter.',
        message: 'Route parameter "id" is required.',
      })
    }
  })

  it('creates collection handlers that proxy to upstream path with method', async () => {
    vi.mocked(proxyAuthApiRequest).mockResolvedValueOnce({ ok: true })

    const handler = createProxyCollectionHandler({
      upstreamPath: '/api/v1/user_group',
      method: 'POST',
    })

    const event = {} as H3Event
    await handler(event)

    expect(proxyAuthApiRequest).toHaveBeenCalledWith(event, '/api/v1/user_group', 'POST')
  })

  it('creates entity handlers that validate param and build encoded path', async () => {
    vi.mocked(proxyAuthApiGet).mockResolvedValueOnce({ id: '42' })

    const handler = createProxyEntityHandler({
      paramName: 'id',
      method: 'GET',
      upstreamPathBuilder: id => `/api/v1/user/${encodeURIComponent(id)}`,
    })

    const event = { context: { params: { id: 'value with spaces' } } } as unknown as H3Event
    await handler(event)

    expect(proxyAuthApiGet).toHaveBeenCalledWith(event, '/api/v1/user/value%20with%20spaces')
  })
})

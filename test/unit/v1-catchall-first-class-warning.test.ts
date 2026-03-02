import { describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'
import { createVersionedCatchAllProxyHandler } from '../../server/utils/proxy-handler-factory'
import { proxyAuthApiRequest } from '../../server/utils/auth-api-proxy'

vi.mock('../../server/utils/auth-api-proxy', () => ({
  proxyAuthApiRequest: vi.fn(),
  proxyAuthApiGet: vi.fn(),
}))

vi.mock('../../server/utils/require-auth', () => ({
  requireAuthenticatedRequest: vi.fn(),
}))

describe('v1 catch-all first-class warning', () => {
  it('warns when catch-all is used for first-class domains', async () => {
    vi.mocked(proxyAuthApiRequest).mockResolvedValueOnce({ ok: true })
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const handler = createVersionedCatchAllProxyHandler('v1')
    const event = {
      context: { params: { path: 'tools/health' } },
      node: { req: { method: 'GET' } },
    } as unknown as H3Event

    await handler(event)

    expect(proxyAuthApiRequest).toHaveBeenCalledWith(event, '/api/v1/tools/health', 'GET')
    expect(warnSpy).toHaveBeenCalledWith(
      '[api-routing] Fallback v1 catch-all route used for first-class domain path "tools/health". ' +
      'Create a dedicated server/api/v1 handler for this endpoint.',
    )

    warnSpy.mockRestore()
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'

vi.mock('../../server/utils/authorization', () => ({
  resolveAuthorizationHeader: vi.fn(() => 'Bearer test-token'),
}))

function installH3RuntimeMocks({ timeoutMs = 50 }: { timeoutMs?: number } = {}) {
  vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
    authApiBase: 'http://primary',
    authApiTimeoutMs: timeoutMs,
    public: {
      authApiBase: 'http://secondary',
    },
  })))

  vi.stubGlobal('readBody', vi.fn(async () => ({ hello: 'world' })))

  vi.stubGlobal('createError', vi.fn((input: {
    statusCode: number
    statusMessage: string
    message: string
  }) => {
    const error = new Error(input.message) as Error & {
      statusCode: number
      statusMessage: string
    }

    error.statusCode = input.statusCode
    error.statusMessage = input.statusMessage
    return error
  }))

  vi.stubGlobal('isError', vi.fn((value: unknown) => {
    return value instanceof Error
      || (typeof value === 'object' && value !== null && 'statusCode' in value)
  }))
}

async function loadProxyModule() {
  vi.resetModules()
  return await import('../../server/utils/auth-api-proxy')
}

describe('auth-api-proxy', () => {
  beforeEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('falls back to next upstream on timeout and returns success payload', async () => {
    vi.useFakeTimers()
    installH3RuntimeMocks({ timeoutMs: 20 })

    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.startsWith('http://primary')) {
        return await new Promise<Response>((resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const abortError = new Error('aborted')
            abortError.name = 'AbortError'
            reject(abortError)
          })

          setTimeout(() => {
            resolve(new Response(JSON.stringify({ delayed: true }), {
              status: 200,
              headers: { 'content-type': 'application/json' },
            }))
          }, 100)
        })
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    })

    vi.stubGlobal('fetch', fetchMock)

    const { proxyAuthApiGet } = await loadProxyModule()
    const promise = proxyAuthApiGet({ context: {} } as H3Event, '/api/v1/profile')

    await vi.advanceTimersByTimeAsync(30)
    const payload = await promise

    expect(payload).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0]?.[0]).toContain('http://primary')
    expect(fetchMock.mock.calls[1]?.[0]).toContain('http://secondary')
  })

  it('does not fallback on upstream 4xx errors', async () => {
    installH3RuntimeMocks()

    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ message: 'invalid request' }), {
        status: 400,
        statusText: 'Bad Request',
        headers: { 'content-type': 'application/json' },
      })
    })

    vi.stubGlobal('fetch', fetchMock)

    const { proxyAuthApiGet } = await loadProxyModule()

    await expect(proxyAuthApiGet({ context: {} } as H3Event, '/api/v1/profile')).rejects.toMatchObject({
      statusCode: 400,
      message: 'invalid request',
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retries next upstream when first candidate returns 401 and second succeeds', async () => {
    installH3RuntimeMocks()

    const fetchMock = vi.fn(async (url: string) => {
      if (url.startsWith('http://primary')) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), {
          status: 401,
          statusText: 'Unauthorized',
          headers: { 'content-type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    })

    vi.stubGlobal('fetch', fetchMock)

    const { proxyAuthApiGet } = await loadProxyModule()

    await expect(proxyAuthApiGet({ context: {} } as H3Event, '/api/v1/profile')).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('returns 401 when all upstream candidates reject authorization', async () => {
    installH3RuntimeMocks()

    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        statusText: 'Unauthorized',
        headers: { 'content-type': 'application/json' },
      })
    })

    vi.stubGlobal('fetch', fetchMock)

    const { proxyAuthApiGet } = await loadProxyModule()

    await expect(proxyAuthApiGet({ context: {} } as H3Event, '/api/v1/profile')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Upstream auth API rejected the Authorization header.',
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('falls back on upstream 5xx errors and reuses successful upstream on next request', async () => {
    installH3RuntimeMocks()

    const fetchMock = vi.fn(async (url: string) => {
      if (url.startsWith('http://primary')) {
        return new Response('gateway failure', { status: 502, statusText: 'Bad Gateway' })
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    })

    vi.stubGlobal('fetch', fetchMock)

    const { proxyAuthApiGet } = await loadProxyModule()

    await expect(proxyAuthApiGet({ context: {} } as H3Event, '/api/v1/profile')).resolves.toEqual({ ok: true })

    fetchMock.mockClear()

    await expect(proxyAuthApiGet({ context: {} } as H3Event, '/api/v1/profile')).resolves.toEqual({ ok: true })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]?.[0]).toContain('http://secondary')
  })
})

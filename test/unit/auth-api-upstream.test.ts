import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'

async function loadModule() {
  vi.resetModules()
  return await import('../../server/utils/auth-api-upstream')
}

describe('getAuthApiUpstreamCandidates', () => {
  const originalNodeEnv = process.env.NODE_ENV
  const originalLocalFallback = process.env.NUXT_AUTH_API_ALLOW_LOCAL_FALLBACK

  beforeEach(() => {
    vi.unstubAllGlobals()
    vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
      authApiBase: 'https://bro-world.org',
      public: {
        authApiBase: 'https://bro-world.org',
      },
    })))
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
    process.env.NUXT_AUTH_API_ALLOW_LOCAL_FALLBACK = originalLocalFallback
    vi.unstubAllGlobals()
  })

  it('excludes localhost fallbacks in production by default', async () => {
    process.env.NODE_ENV = 'production'
    delete process.env.NUXT_AUTH_API_ALLOW_LOCAL_FALLBACK

    const { getAuthApiUpstreamCandidates } = await loadModule()
    const candidates = getAuthApiUpstreamCandidates({} as H3Event)

    expect(candidates).toEqual(['https://bro-world.org'])
  })

  it('includes localhost fallbacks outside production', async () => {
    process.env.NODE_ENV = 'development'
    delete process.env.NUXT_AUTH_API_ALLOW_LOCAL_FALLBACK

    const { getAuthApiUpstreamCandidates } = await loadModule()
    const candidates = getAuthApiUpstreamCandidates({} as H3Event)

    expect(candidates).toEqual([
      'https://bro-world.org',
      'http://host.docker.internal',
      'http://localhost',
    ])
  })

  it('allows forcing localhost fallback in production via env flag', async () => {
    process.env.NODE_ENV = 'production'
    process.env.NUXT_AUTH_API_ALLOW_LOCAL_FALLBACK = '1'

    const { getAuthApiUpstreamCandidates } = await loadModule()
    const candidates = getAuthApiUpstreamCandidates({} as H3Event)

    expect(candidates).toEqual([
      'https://bro-world.org',
      'http://host.docker.internal',
      'http://localhost',
    ])
  })
})

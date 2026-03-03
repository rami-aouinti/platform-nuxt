import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'

async function loadModule() {
  vi.resetModules()
  return await import('../../server/utils/auth-api-upstream')
}

describe('getAuthApiUpstreamCandidates', () => {
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
    vi.unstubAllGlobals()
  })

  it('returns only bro-world auth API candidates (no localhost fallback)', async () => {
    const { getAuthApiUpstreamCandidates } = await loadModule()
    const candidates = getAuthApiUpstreamCandidates({} as H3Event)

    expect(candidates).toEqual(['https://bro-world.org'])
  })

  it('keeps order and deduplicates auth API bases', async () => {
    vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
      authApiBase: 'https://bro-world.org',
      public: {
        authApiBase: 'https://api.bro-world.org',
      },
    })))

    const { getAuthApiUpstreamCandidates } = await loadModule()
    const candidates = getAuthApiUpstreamCandidates({} as H3Event)

    expect(candidates).toEqual(['https://bro-world.org', 'https://api.bro-world.org'])
  })
})

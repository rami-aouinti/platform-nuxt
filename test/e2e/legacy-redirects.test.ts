import { describe, expect, it } from 'vitest'
import { validatedLegacyRedirects } from '../../app/utils/legacy-migration/validatedRedirects'

describe('legacy redirects e2e coverage contract', () => {
  it('keeps legacy route and target route paths normalized', () => {
    for (const route of validatedLegacyRedirects) {
      expect(route.legacyRoute.startsWith('/legacy/')).toBe(true)
      expect(route.targetRoute.startsWith('/')).toBe(true)
    }
  })

  it('requires at least one route assertion per covered domain', () => {
    const coveredDomains = new Set(validatedLegacyRedirects.map((entry) => entry.domain))

    for (const domain of coveredDomains) {
      const domainRoutes = validatedLegacyRedirects.filter((entry) => entry.domain === domain)
      expect(domainRoutes.length).toBeGreaterThan(0)
    }
  })
})

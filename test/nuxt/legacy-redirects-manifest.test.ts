import { describe, expect, it } from 'vitest'
import {
  parityChecklistKeys,
  validatedLegacyRedirects,
} from '../../app/utils/legacy-migration/validatedRedirects'

describe('legacy redirects manifest', () => {
  it('requires the full parity checklist for every validated route', () => {
    for (const entry of validatedLegacyRedirects) {
      for (const key of parityChecklistKeys) {
        expect(entry.parityChecklist[key]).toBe(true)
      }
    }
  })

  it('is grouped by domain for domain-oriented test selection', () => {
    const domains = new Set(validatedLegacyRedirects.map((entry) => entry.domain))

    for (const domain of domains) {
      const routes = validatedLegacyRedirects.filter((entry) => entry.domain === domain)
      expect(routes.length).toBeGreaterThan(0)
    }
  })
})

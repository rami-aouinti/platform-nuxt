import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function extractI18nKeys(path: string) {
  const source = readFileSync(path, 'utf8')
  const matches = [...source.matchAll(/t\('([^']+)'/g)]
  return matches.map((match) => match[1]).sort()
}

describe('offers pages i18n keys', () => {
  it('keeps i18n keys stable for received applications page', () => {
    const keys = extractI18nKeys('app/pages/offers/received-applications.vue')
    expect(keys).toMatchSnapshot()
  })
})

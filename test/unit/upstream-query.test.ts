import { describe, expect, it } from 'vitest'
import { buildQuerySuffixFromQuery } from '../../server/utils/upstream-query'

describe('buildQuerySuffixFromQuery', () => {
  it('converts order=field:direction to api-platform order[field]=direction', () => {
    const suffix = buildQuerySuffixFromQuery({
      order: 'legalName:asc',
      limit: 10,
      offset: 0,
    })

    expect(suffix).toBe('?order%5BlegalName%5D=asc&limit=10&offset=0')
  })

  it('keeps order unchanged when expression is invalid', () => {
    const suffix = buildQuerySuffixFromQuery({
      order: 'legalName',
      limit: 10,
    })

    expect(suffix).toBe('?order=legalName&limit=10')
  })
})

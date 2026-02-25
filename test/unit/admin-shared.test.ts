import { describe, expect, it } from 'vitest'
import { normalizePaginatedResponse } from '../../services/admin/pagination'

describe('normalizePaginatedResponse', () => {
  it('normalizes array responses to paginated shape', () => {
    const response = normalizePaginatedResponse([{ id: '1' }])

    expect(response.data).toEqual([{ id: '1' }])
    expect(response.meta?.totalItems).toBe(1)
  })

  it('normalizes legacy items payload', () => {
    const response = normalizePaginatedResponse({
      items: [{ id: '1' }, { id: '2' }],
      total: 2,
    })

    expect(response.data).toEqual([{ id: '1' }, { id: '2' }])
    expect(response.meta?.totalItems).toBe(2)
  })
})

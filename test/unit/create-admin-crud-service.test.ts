import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAdminCrudService, type ListQuery } from '../../services/admin/shared/index'
import { httpDelete, httpGet, httpPatch, httpPost, httpPut } from '../../services/http/client'

vi.mock('../../services/http/client', () => ({
  httpGet: vi.fn(),
  httpPost: vi.fn(),
  httpPut: vi.fn(),
  httpPatch: vi.fn(),
  httpDelete: vi.fn(),
}))

describe('createAdminCrudService', () => {
  const basePath = '/admin/things'
  const service = createAdminCrudService<{ id: string; name: string }, { name: string }, { name: string }, { name?: string }>(basePath)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('list() calls GET on base path and returns a normalized paginated payload', async () => {
    const query: ListQuery = {
      page: 2,
      pageSize: 5,
      sortBy: 'name',
      sortOrder: 'desc',
      filters: { enabled: true },
      where: { team: 'engineering' },
      search: 'foo',
    }

    vi.mocked(httpGet).mockResolvedValueOnce([{ id: '1', name: 'Alpha' }])

    const response = await service.list(query)

    expect(httpGet).toHaveBeenCalledWith(basePath, {
      query: {
        where: JSON.stringify({ enabled: true, team: 'engineering' }),
        order: 'name:desc',
        limit: 5,
        offset: 5,
        search: 'foo',
      },
    })
    expect(response.data).toEqual([{ id: '1', name: 'Alpha' }])
    expect(response.meta?.totalItems).toBe(1)
  })

  it('count() calls GET on /count', async () => {
    vi.mocked(httpGet).mockResolvedValueOnce({ count: 42 })

    const response = await service.count()

    expect(httpGet).toHaveBeenCalledWith(`${basePath}/count`)
    expect(response).toEqual({ count: 42 })
  })

  it('ids() calls GET on /ids', async () => {
    vi.mocked(httpGet).mockResolvedValueOnce(['1', '2'])

    const response = await service.ids()

    expect(httpGet).toHaveBeenCalledWith(`${basePath}/ids`)
    expect(response).toEqual(['1', '2'])
  })

  it('getById() calls GET on /:id', async () => {
    vi.mocked(httpGet).mockResolvedValueOnce({ id: '1', name: 'Alpha' })

    const response = await service.getById('1')

    expect(httpGet).toHaveBeenCalledWith(`${basePath}/1`)
    expect(response).toEqual({ id: '1', name: 'Alpha' })
  })

  it('create() calls POST on base path', async () => {
    vi.mocked(httpPost).mockResolvedValueOnce({ id: '1', name: 'Alpha' })

    const payload = { name: 'Alpha' }
    const response = await service.create(payload)

    expect(httpPost).toHaveBeenCalledWith(basePath, payload)
    expect(response).toEqual({ id: '1', name: 'Alpha' })
  })

  it('update() calls PUT on /:id', async () => {
    vi.mocked(httpPut).mockResolvedValueOnce({ id: '1', name: 'Bravo' })

    const payload = { name: 'Bravo' }
    const response = await service.update('1', payload)

    expect(httpPut).toHaveBeenCalledWith(`${basePath}/1`, payload)
    expect(response).toEqual({ id: '1', name: 'Bravo' })
  })

  it('patch() calls PATCH on /:id', async () => {
    vi.mocked(httpPatch).mockResolvedValueOnce({ id: '1', name: 'Charlie' })

    const payload = { name: 'Charlie' }
    const response = await service.patch('1', payload)

    expect(httpPatch).toHaveBeenCalledWith(`${basePath}/1`, payload)
    expect(response).toEqual({ id: '1', name: 'Charlie' })
  })

  it('remove() calls DELETE on /:id', async () => {
    vi.mocked(httpDelete).mockResolvedValueOnce({ success: true })

    const response = await service.remove('1')

    expect(httpDelete).toHaveBeenCalledWith(`${basePath}/1`)
    expect(response).toEqual({ success: true })
  })
})

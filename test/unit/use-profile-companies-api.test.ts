import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiRequestMock = vi.fn()

vi.mock('~/composables/api/httpUiErrors', () => ({
  apiRequest: apiRequestMock,
  normalizePaginatedResponse: (payload: unknown) => payload,
}))

vi.mock('~/services/api/endpoints', () => ({
  apiEndpoints: {
    frontend: {
      companies: {
        base: '/api/v1/me/profile/companies',
        schemaByMethod: (method?: 'post' | 'put' | 'patch') =>
          method ? `/api/v1/me/profile/companies/schema?method=${method}` : '/api/v1/me/profile/companies/schema',
        companyById: (id: string | number) => `/api/v1/me/profile/companies/${id}`,
      },
    },
  },
}))

describe('useProfileCompaniesApi.getSchema', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls /schema without query when no method is provided', async () => {
    apiRequestMock.mockResolvedValueOnce({})
    const { useProfileCompaniesApi } = await import('../../app/composables/useProfileCompaniesApi')

    await useProfileCompaniesApi().getSchema()

    expect(apiRequestMock).toHaveBeenCalledWith('GET', '/api/v1/me/profile/companies/schema')
  })

  it('calls /schema with optional method query when method is provided', async () => {
    apiRequestMock.mockResolvedValueOnce({})
    const { useProfileCompaniesApi } = await import('../../app/composables/useProfileCompaniesApi')

    await useProfileCompaniesApi().getSchema('post')

    expect(apiRequestMock).toHaveBeenCalledWith('GET', '/api/v1/me/profile/companies/schema?method=post')
  })
})

import { apiRequest, normalizePaginatedResponse, type ApiListResponse } from './httpUiErrors'

export type PlatformApplication = {
  id: string
  userApplicationId: string | null
  name: string
  logo: string | null
  description: string | null
  active: boolean
  enabled: boolean | null
}

type ApplicationsResponse = {
  items?: PlatformApplication[]
  data?: PlatformApplication[]
}

function normalizeApplication(entry: Partial<PlatformApplication>): PlatformApplication {
  return {
    id: String(entry.id ?? ''),
    userApplicationId:
      typeof entry.userApplicationId === 'string' && entry.userApplicationId.length > 0
        ? entry.userApplicationId
        : null,
    name: String(entry.name ?? 'Application'),
    logo: typeof entry.logo === 'string' ? entry.logo : null,
    description: typeof entry.description === 'string' ? entry.description : null,
    active: Boolean(entry.active),
    enabled:
      entry.enabled === null || entry.enabled === undefined
        ? null
        : Boolean(entry.enabled),
  }
}

function normalizeList(payload: ApiListResponse<PlatformApplication> | ApplicationsResponse) {
  return normalizePaginatedResponse(payload as ApiListResponse<PlatformApplication>).data.map(
    normalizeApplication,
  )
}

export function usePlatformApplicationsApi() {
  return {
    listAll: async () => {
      const payload = await apiRequest<ApiListResponse<PlatformApplication> | ApplicationsResponse>(
        'GET',
        '/api/v1/applications',
      )

      return normalizeList(payload)
    },
    listProfile: async () => {
      const payload = await apiRequest<ApiListResponse<PlatformApplication> | ApplicationsResponse>(
        'GET',
        '/api/v1/profile/applications',
      )

      return normalizeList(payload)
    },
    attach: async (id: string) =>
      normalizeApplication(
        await apiRequest<PlatformApplication>('POST', `/api/v1/profile/applications/${id}/attach`),
      ),
    detach: async (id: string) => {
      await apiRequest<unknown>('DELETE', `/api/v1/profile/applications/${id}/detach`)
    },
  }
}

import { apiRequest, normalizePaginatedResponse, type ApiListResponse } from './httpUiErrors'

export type ProfileApplication = {
  id: string
  name: string
  logo: string | null
  description: string | null
  active: boolean
  enabled: boolean
}

type ProfileApplicationsResponse = {
  items?: ProfileApplication[]
  data?: ProfileApplication[]
}

function normalizeApplication(entry: Partial<ProfileApplication>): ProfileApplication {
  return {
    id: String(entry.id ?? ''),
    name: String(entry.name ?? 'Application'),
    logo: typeof entry.logo === 'string' ? entry.logo : null,
    description: typeof entry.description === 'string' ? entry.description : null,
    active: Boolean(entry.active),
    enabled: Boolean(entry.enabled),
  }
}

export function useProfileApplicationsApi() {
  const listPath = '/api/v1/me/profile/applications'

  return {
    list: async () => {
      const payload = await apiRequest<ApiListResponse<ProfileApplication> | ProfileApplicationsResponse>('GET', listPath)
      return normalizePaginatedResponse(payload as ApiListResponse<ProfileApplication>).data.map(normalizeApplication)
    },
    activate: async (id: string) =>
      normalizeApplication(
        await apiRequest<ProfileApplication>('POST', `/api/v1/profile/applications/${id}/activate`),
      ),
    deactivate: async (id: string) =>
      normalizeApplication(
        await apiRequest<ProfileApplication>('POST', `/api/v1/profile/applications/${id}/deactivate`),
      ),
  }
}

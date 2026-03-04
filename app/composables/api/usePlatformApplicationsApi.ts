import { apiRequest, normalizePaginatedResponse, type ApiListResponse } from './httpUiErrors'

export type PlatformApplication = {
  id: string
  userApplicationId: string | null
  applicationId: string | null
  applicationName: string | null
  applicationKeyName: string | null
  name: string
  keyName: string | null
  logo: string | null
  description: string | null
  active: boolean
  public: boolean
  owner: boolean
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
        : typeof entry.id === 'string' && entry.id.length > 0
          ? entry.id
          : null,
    applicationId:
      typeof entry.applicationId === 'string' && entry.applicationId.length > 0
        ? entry.applicationId
        : null,
    applicationName:
      typeof entry.applicationName === 'string' && entry.applicationName.length > 0
        ? entry.applicationName
        : null,
    applicationKeyName:
      typeof entry.applicationKeyName === 'string' && entry.applicationKeyName.length > 0
        ? entry.applicationKeyName
        : null,
    keyName:
      typeof entry.keyName === 'string' && entry.keyName.length > 0
        ? entry.keyName
        : null,
    name: String(entry.name ?? 'Application'),
    logo: typeof entry.logo === 'string' ? entry.logo : null,
    description: typeof entry.description === 'string' ? entry.description : null,
    active: Boolean(entry.active),
    public: Boolean(entry.public),
    owner: Boolean(entry.owner),
  }
}

function normalizeList(payload: ApiListResponse<PlatformApplication> | ApplicationsResponse) {
  return normalizePaginatedResponse(payload as ApiListResponse<PlatformApplication>).data.map(
    normalizeApplication,
  )
}

export function usePlatformApplicationsApi() {
  return {
    listUserApplications: async () => {
      const payload = await apiRequest<ApiListResponse<PlatformApplication> | ApplicationsResponse>(
        'GET',
        '/api/v1/user-applications',
      )

      return normalizeList(payload)
    },
  }
}

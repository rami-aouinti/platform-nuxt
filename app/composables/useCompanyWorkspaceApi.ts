import { apiRequest, type Id } from '~/composables/api/httpUiErrors'
import { apiEndpoints } from '~/services/api/endpoints'

export type CompanyDetail = {
  id: Id
  legalName?: string | null
  name?: string | null
  owner?: {
    id?: Id
    username?: string | null
    firstName?: string | null
    lastName?: string | null
    email?: string | null
  } | null
  status?: string | null
  photoUrl?: string | null
  description?: string | null
  [key: string]: unknown
}

export type CompanyMembership = {
  id: Id
  user?: {
    id?: Id
    username?: string | null
    firstName?: string | null
    lastName?: string | null
    email?: string | null
  } | null
  role?: string | null
  status?: string | null
  joinedAt?: string | null
  invitedAt?: string | null
  [key: string]: unknown
}

export type CompanyProjectSummary = {
  id: Id
  name?: string | null
  title?: string | null
  status?: string | null
  photoUrl?: string | null
  [key: string]: unknown
}

type CollectionPayload<T> = T[] | { data?: T[]; items?: T[]; results?: T[] | { data?: T[]; items?: T[] } }

function normalizeCollectionPayload<T>(payload: CollectionPayload<T>): T[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.items)) return payload.items

  const results = payload.results
  if (Array.isArray(results)) return results
  if (results && typeof results === 'object') {
    if (Array.isArray(results.data)) return results.data
    if (Array.isArray(results.items)) return results.items
  }

  return []
}

export function useCompanyWorkspaceApi() {
  return {
    getCompany: (companyId: Id) =>
      apiRequest<CompanyDetail>('GET', apiEndpoints.frontend.companyWorkspace.companyById(companyId)),

    getMembership: (companyId: Id) =>
      apiRequest<CompanyMembership>('GET', apiEndpoints.frontend.companyWorkspace.membership(companyId)),

    listCompanyProjects: async (companyId: Id) => {
      const payload = await apiRequest<CollectionPayload<CompanyProjectSummary>>(
        'GET',
        apiEndpoints.frontend.companyWorkspace.projects(companyId),
      )
      return normalizeCollectionPayload(payload)
    },
  }
}

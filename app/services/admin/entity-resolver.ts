import type { AdminResourceEndpoint, AdminResourceListEndpoint } from '~/types/admin-resource'

export function resolveAdminEndpoint(endpoint: AdminResourceEndpoint | undefined, id?: string) {
  if (!endpoint) {
    return null
  }

  if (typeof endpoint === 'function') {
    return endpoint({ id })
  }

  return endpoint
}

export function resolveAdminListEndpoints(endpoint: AdminResourceListEndpoint) {
  if (typeof endpoint === 'string' || typeof endpoint === 'function') {
    return {
      listEndpoint: resolveAdminEndpoint(endpoint),
      countEndpoint: null,
    }
  }

  return {
    listEndpoint: resolveAdminEndpoint(endpoint.endpoint),
    countEndpoint: resolveAdminEndpoint(endpoint.countEndpoint),
  }
}

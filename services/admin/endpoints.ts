export const adminEndpoints = {
  apiKeys: {
    v1: {
      base: '/api/v1/me/api_key',
      count: '/api/v1/me/api_key/count',
      ids: '/api/v1/me/api_key/ids',
      schema: '/api/v1/me/api_key/schema',
    },
    v2: {
      base: '/api/v2/api_key',
      count: '/api/v2/api_key/count',
      ids: '/api/v2/api_key/ids',
      schema: '/api/v2/api_key/schema',
    },
  },
  users: {
    base: '/api/v1/admin/users',
    count: '/api/v1/admin/users/count',
    ids: '/api/v1/admin/users/ids',
    schema: '/api/v1/admin/users/schema',
  },
  roles: {
    base: '/api/v1/admin/role',
    count: '/api/v1/admin/role/count',
    ids: '/api/v1/admin/role/ids',
    schema: '/api/v1/admin/role/schema',
    byRole: '/api/v1/role/{role}',
    inherited: '/api/v1/role/{role}/inherited',
  },
  userGroups: {
    base: '/api/v1/admin/user_group',
    count: '/api/v1/admin/user_group/count',
    ids: '/api/v1/admin/user_group/ids',
    schema: '/api/v1/admin/user_group/schema',
    attachUser: '/api/v1/user_group/{userGroup}/user/{user}',
    users: '/api/v1/user_group/{userGroup}/users',
  },
  companies: {
    base: '/api/v1/admin/companies',
    schema: '/api/v1/admin/companies/schema',
  },
  candidates: {
    base: '/api/v1/admin/candidates',
    schema: '/api/v1/admin/candidates/schema',
  },
  jobOffers: {
    base: '/api/v1/admin/job-offers',
    facets: '/api/v1/admin/job-offers/facets',
    my: '/api/v1/admin/job-offers/my',
    available: '/api/v1/admin/job-offers/available',
    apply: '/api/v1/admin/job-offers/{id}/apply',
  },
  jobApplications: {
    base: '/api/v1/admin/job-applications',
    myOffers: '/api/v1/admin/job-applications/my-offers',
    accept: '/api/v1/admin/job-applications/{id}/accept',
    reject: '/api/v1/admin/job-applications/{id}/reject',
    withdraw: '/api/v1/admin/job-applications/{id}/withdraw',
  },
  notifications: {
    base: '/api/v1/admin/notifications',
    unreadCount: '/api/v1/admin/notifications/users/{id}/unread-count',
  },
} as const

export function withPathParams(path: string, params: Record<string, string | number>) {
  return Object.entries(params).reduce(
    (resolvedPath, [key, value]) => resolvedPath.replaceAll(`{${key}}`, encodeURIComponent(String(value))),
    path,
  )
}

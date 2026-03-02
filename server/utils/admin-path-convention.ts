const ADMIN_ROUTE_PREFIX = 'admin/'

const legacyResourceBaseByAdminResource: Record<string, string> = {
  users: '/api/api/v1/admin/users',
  roles: '/api/api/v1/admin/role',
  'user-groups': '/api/api/v1/admin/user_group',
  'api-keys': '/api/v1/api_key',
  companies: '/api/companies',
  candidates: '/api/v1/candidates',
  'job-offers': '/api/job-offers',
  'job-applications': '/api/job-applications',
  notifications: '/api/notifications',
}

export function mapAdminRouteToLegacyUpstreamPath(path: string): string | null {
  if (!path.startsWith(ADMIN_ROUTE_PREFIX)) {
    return null
  }

  const adminPath = path.slice(ADMIN_ROUTE_PREFIX.length)
  const [resource = '', ...rest] = adminPath.split('/').filter(Boolean)
  const upstreamBase = legacyResourceBaseByAdminResource[resource]

  if (!upstreamBase) {
    return null
  }

  if (rest.length === 0) {
    return upstreamBase
  }

  return `${upstreamBase}/${rest.join('/')}`
}

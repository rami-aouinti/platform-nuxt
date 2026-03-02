export type CanonicalResourceKey =
  | 'profile'
  | 'profileRoles'
  | 'profileGroups'

export type ProxyHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface CanonicalEndpointDefinition {
  canonical: string
  legacyAliases: string[]
  deprecation: {
    warnUntil: string
    removalAfter: string
    note: string
  }
}

export const API_CANONICAL_ENDPOINT_MAP: Record<CanonicalResourceKey, CanonicalEndpointDefinition> = {
  profile: {
    canonical: '/api/v1/me/profile',
    legacyAliases: ['/api/v1/profile', '/api/profile'],
    deprecation: {
      warnUntil: '2026-06-30',
      removalAfter: '2026-07-01',
      note: 'Use /api/v1/me/profile as the only supported upstream endpoint.',
    },
  },
  profileRoles: {
    canonical: '/api/v1/me/profile/roles',
    legacyAliases: ['/api/v1/profile/roles', '/api/profile/roles'],
    deprecation: {
      warnUntil: '2026-06-30',
      removalAfter: '2026-07-01',
      note: 'Use /api/v1/me/profile/roles as the only supported upstream endpoint.',
    },
  },
  profileGroups: {
    canonical: '/api/v1/me/profile/groups',
    legacyAliases: ['/api/v1/profile/groups', '/api/profile/groups'],
    deprecation: {
      warnUntil: '2026-06-30',
      removalAfter: '2026-07-01',
      note: 'Use /api/v1/me/profile/groups as the only supported upstream endpoint.',
    },
  },
}

export function getOrderedCandidateEndpoints(
  resource: CanonicalResourceKey,
): string[] {
  const { canonical, legacyAliases } = API_CANONICAL_ENDPOINT_MAP[resource]
  return [canonical, ...legacyAliases]
}

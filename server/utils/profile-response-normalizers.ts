import type { GroupCandidate, NormalizedAuthProfile, RoleCandidate } from '../types/profile'

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function normalizeRoleId(role: RoleCandidate): string | null {
  if (typeof role === 'string' && role.length > 0) {
    return role
  }

  if (role && typeof role === 'object' && typeof role.id === 'string' && role.id.length > 0) {
    return role.id
  }

  return null
}

export function normalizeProfileRoles(payload: unknown): string[] {
  if (Array.isArray(payload)) {
    return payload
      .map(role => normalizeRoleId(role as RoleCandidate))
      .filter((role): role is string => Boolean(role))
  }

  if (payload && typeof payload === 'object' && 'roles' in payload) {
    return normalizeProfileRoles((payload as { roles?: unknown }).roles)
  }

  return []
}

export function normalizeProfileGroups(payload: unknown): GroupCandidate[] {
  const source =
    payload && typeof payload === 'object' && 'groups' in payload
      ? (payload as { groups?: unknown }).groups
      : payload

  if (!Array.isArray(source)) {
    return []
  }

  return source.filter((group): group is GroupCandidate => {
    return Boolean(group) && typeof group === 'object'
  })
}

export function normalizeProfilePayload(payload: unknown): NormalizedAuthProfile {
  const source = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>

  return {
    ...source,
    id: (source.id as string | number | undefined) ?? '',
    username: asString(source.username),
    firstName: asString(source.firstName ?? source.first_name),
    lastName: asString(source.lastName ?? source.last_name),
    email: asString(source.email),
    language: asString(source.language),
    locale: asString(source.locale),
    timezone: asString(source.timezone),
    roles: normalizeProfileRoles(source.roles),
  }
}

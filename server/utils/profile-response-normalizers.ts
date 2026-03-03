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

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return normalizeProfileRoles((payload as { data?: unknown }).data)
  }

  return []
}

export function normalizeProfileGroups(payload: unknown): GroupCandidate[] {
  const source =
    payload && typeof payload === 'object' && 'groups' in payload
      ? (payload as { groups?: unknown }).groups
      : payload && typeof payload === 'object' && 'data' in payload
        ? (payload as { data?: unknown }).data
      : payload

  if (!Array.isArray(source)) {
    return []
  }

  return source.filter((group): group is GroupCandidate => {
    return Boolean(group) && typeof group === 'object'
  })
}

export function normalizeProfilePayload(payload: unknown): NormalizedAuthProfile {
  const payloadRecord = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>
  const source =
    payloadRecord.profile && typeof payloadRecord.profile === 'object'
      ? payloadRecord.profile as Record<string, unknown>
      : payloadRecord.data && typeof payloadRecord.data === 'object'
        ? payloadRecord.data as Record<string, unknown>
        : payloadRecord

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


function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(item => sortObjectKeys(item))
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  const record = value as Record<string, unknown>
  const normalized: Record<string, unknown> = {}

  for (const key of Object.keys(record).sort((left, right) => left.localeCompare(right))) {
    normalized[key] = sortObjectKeys(record[key])
  }

  return normalized
}

export function normalizeDeterministicPayload<T>(payload: T): T {
  return sortObjectKeys(payload) as T
}

export function normalizeProfileCollectionPayload(payload: unknown): unknown {
  return normalizeDeterministicPayload(payload)
}

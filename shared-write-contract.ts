export type WriteEntityName = 'UserProfile' | 'Company' | 'CompanyMembership' | 'BlogPost' | 'BlogComment'

export type RelationIdField = 'userId' | 'companyId' | 'ownerId' | 'postId'

export const WRITE_RELATION_ID_FIELDS: Record<WriteEntityName, RelationIdField[]> = {
  UserProfile: ['userId', 'companyId'],
  Company: ['ownerId'],
  CompanyMembership: ['userId', 'companyId'],
  BlogPost: ['ownerId', 'companyId'],
  BlogComment: ['postId', 'ownerId'],
}

export const WRITE_RELATION_OBJECT_ALIASES: Record<WriteEntityName, Partial<Record<RelationIdField, string[]>>> = {
  UserProfile: {
    userId: ['user'],
    companyId: ['company'],
  },
  Company: {
    ownerId: ['owner'],
  },
  CompanyMembership: {
    userId: ['user'],
    companyId: ['company'],
  },
  BlogPost: {
    ownerId: ['owner', 'author', 'user'],
    companyId: ['company'],
  },
  BlogComment: {
    postId: ['post', 'blogPost'],
    ownerId: ['owner', 'author', 'user'],
  },
}

export function extractId(value: unknown): string | null {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
  }

  if (value && typeof value === 'object') {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'string' && id.trim().length > 0) {
      return id
    }
  }

  return null
}

export function normalizeWriteRelations<T extends Record<string, unknown>>(entity: WriteEntityName, payload: T): T {
  const normalized: Record<string, unknown> = { ...payload }
  const aliases = WRITE_RELATION_OBJECT_ALIASES[entity]

  for (const idField of WRITE_RELATION_ID_FIELDS[entity]) {
    const directId = extractId(normalized[idField])

    if (directId) {
      normalized[idField] = directId
      continue
    }

    const candidateAliases = aliases[idField] ?? []
    for (const alias of candidateAliases) {
      const aliasId = extractId(normalized[alias])
      if (aliasId) {
        normalized[idField] = aliasId
        break
      }
    }

    for (const alias of candidateAliases) {
      if (alias in normalized) {
        normalized[alias] = undefined
      }
    }
  }

  return normalized as T
}

export function validateWriteRelations(entity: WriteEntityName, payload: Record<string, unknown>): string[] {
  const errors: string[] = []

  for (const idField of WRITE_RELATION_ID_FIELDS[entity]) {
    const value = payload[idField]
    if (value == null) {
      continue
    }

    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push(`Field "${idField}" must be a non-empty string identifier.`)
    }
  }

  return errors
}

export const ADMIN_RESOURCE_ENTITY_CONTRACT: Record<string, WriteEntityName> = {
  'user-profiles': 'UserProfile',
  companies: 'Company',
  'company-memberships': 'CompanyMembership',
  'blog-posts': 'BlogPost',
  'blog-comments': 'BlogComment',
}

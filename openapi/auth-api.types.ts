/**
 * Generated API types for openapi/auth-api.yaml.
 */

export type UserId = string
export type UserGroupId = string
export type RoleId = string
export type NotificationId = string
export type CompanyId = string
export type SocialAccountId = string

export interface Role {
  id?: RoleId
  label?: string
  description?: string
  [key: string]: unknown
}

export interface ErrorResponse {
  code: string
  message: string
  details?: Array<{ field?: string; issue?: string; [key: string]: unknown }>
}

export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface UserBase {
  id?: UserId
  username?: string
  [key: string]: unknown
}

export interface UserProfile extends UserBase {
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
}

export interface UserWithRoles extends UserBase {
  roles?: Role[]
}

export interface UserWithGroups extends UserBase {
  groups?: UserGroupId[]
}

export type UserDetail = UserProfile & UserWithRoles & UserWithGroups

export interface Notification {
  id: NotificationId
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

export interface NotificationListResponse {
  data: Notification[]
  meta: PaginationMeta
}

export interface CompanyMember {
  userId: UserId
  email: string
  firstName?: string
  lastName?: string
  role: string
  status: 'active' | 'invited' | 'suspended'
}

export interface CompanyMemberListResponse {
  data: CompanyMember[]
  meta: PaginationMeta
}

export interface SocialConnectRequest {
  provider: 'google' | 'github' | 'microsoft'
  authorizationCode: string
  redirectUri?: string
}

export interface SocialConnectResponse {
  success: boolean
  provider: string
  accountId: SocialAccountId
  connectedAt: string
}

export interface AuthApiPaths {
  '/api/v1/profile': { get: { response: UserDetail } }
  '/api/v1/profile/roles': { get: { response: UserWithRoles } }
  '/api/v1/profile/groups': { get: { response: UserWithGroups } }
  '/api/v1/role/count': { get: { response: number } }
  '/api/v1/role/ids': { get: { response: RoleId[] } }
  '/api/v1/role/inherited': { get: { response: Role[] } }
  '/api/v1/role/{role}': {
    get: {
      params: { path: { role: RoleId } }
      response: Role
      errors: ErrorResponse
    }
  }
  '/api/v1/notifications': {
    get: {
      params?: { query?: { page?: number; pageSize?: number } }
      response: NotificationListResponse
      errors: ErrorResponse
    }
  }
  '/api/v1/companies/{id}/members': {
    get: {
      params: { path: { id: CompanyId }; query?: { page?: number; pageSize?: number } }
      response: CompanyMemberListResponse
      errors: ErrorResponse
    }
  }
  '/api/v1/auth/social/connect': {
    post: {
      body: SocialConnectRequest
      response: SocialConnectResponse
      errors: ErrorResponse
    }
  }
}

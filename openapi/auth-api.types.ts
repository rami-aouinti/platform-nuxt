/**
 * Generated API types for openapi/auth-api.yaml.
 *
 * Note: regenerated locally from the OpenAPI contract to provide stable,
 * explicit names (UserBase, UserProfile, UserWithRoles, UserWithGroups, UserDetail).
 */

export interface Role {
  id?: string
  label?: string
  description?: string
  [key: string]: unknown
}

export interface UserBase {
  id?: string
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
  groups?: string[]
}

export type UserDetail = UserProfile & UserWithRoles & UserWithGroups

export interface AuthApiPaths {
  '/api/v1/profile': {
    get: {
      response: UserDetail
    }
  }
  '/api/v1/profile/roles': {
    get: {
      response: UserWithRoles
    }
  }
  '/api/v1/profile/groups': {
    get: {
      response: UserWithGroups
    }
  }
  '/api/v1/role/count': {
    get: {
      response: number
    }
  }
  '/api/v1/role/ids': {
    get: {
      response: string[]
    }
  }
  '/api/v1/role/inherited': {
    get: {
      response: Role[]
    }
  }
  '/api/v1/role/{role}': {
    get: {
      params: {
        path: {
          role: string
        }
      }
      response: Role
    }
  }
}

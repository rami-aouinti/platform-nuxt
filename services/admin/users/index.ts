import { createAdminCrudService, type Id, type PatchPayload } from '../shared/index'

import { adminEndpoints } from '../endpoints'

const USERS_BASE_PATH = adminEndpoints.users.base

export const USER_TEXT_MIN_LENGTH = 2
export const USER_TEXT_MAX_LENGTH = 255
export const DEFAULT_TIMEZONE = 'Europe/Kyiv'

export const LANGUAGE_VALUES = ['en', 'ru', 'ua', 'fi'] as const
export const LOCALE_VALUES = ['en', 'ru', 'ua', 'fi'] as const

export type Language = typeof LANGUAGE_VALUES[number]
export type Locale = typeof LOCALE_VALUES[number]

export interface User {
  id: Id
  username: string
  email: string
  firstName: string
  lastName: string
  language: Language
  locale: Locale
  timezone: string
  enabled?: boolean
  roles: string[]
  userGroups: string[]
}

export interface CreateUserRequest {
  username: string
  email: string
  firstName?: string
  lastName?: string
  password: string
  roles?: string[]
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  enabled?: boolean
  roles?: string[]
}

export type PatchUserRequest = PatchPayload

export const usersService = createAdminCrudService<
  User,
  CreateUserRequest,
  UpdateUserRequest,
  PatchUserRequest
>(USERS_BASE_PATH)

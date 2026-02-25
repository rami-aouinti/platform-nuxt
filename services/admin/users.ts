import { httpDelete, httpGet, httpPatch, httpPost, httpPut } from '../http/client'
import type {
  CountResponse,
  Id,
  PaginatedResponse,
  PaginationQuery,
  PatchPayload,
} from './_shared'

const USERS_BASE_PATH = '/api/v1/admin/users'

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

export const usersService = {
  list(query: PaginationQuery = {}) {
    return httpGet<PaginatedResponse<User>>(USERS_BASE_PATH, { query })
  },
  count() {
    return httpGet<CountResponse>(`${USERS_BASE_PATH}/count`)
  },
  ids() {
    return httpGet<Id[]>(`${USERS_BASE_PATH}/ids`)
  },
  getById(id: Id) {
    return httpGet<User>(`${USERS_BASE_PATH}/${id}`)
  },
  create(payload: CreateUserRequest) {
    return httpPost<User, CreateUserRequest>(USERS_BASE_PATH, payload)
  },
  update(id: Id, payload: UpdateUserRequest) {
    return httpPut<User, UpdateUserRequest>(`${USERS_BASE_PATH}/${id}`, payload)
  },
  patch(id: Id, payload: PatchUserRequest) {
    return httpPatch<User, PatchUserRequest>(`${USERS_BASE_PATH}/${id}`, payload)
  },
  remove(id: Id) {
    return httpDelete<unknown>(`${USERS_BASE_PATH}/${id}`)
  },
}

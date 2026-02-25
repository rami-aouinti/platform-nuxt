import { httpDelete, httpGet, httpPatch, httpPost, httpPut } from '../http/client'
import type {
  CountResponse,
  Id,
  PaginatedResponse,
  PaginationQuery,
  PatchPayload,
} from './_shared'

const API_KEYS_V1_BASE_PATH = '/api/v1/admin/api-keys'

export interface ApiKeyV1 {
  id: Id
  label: string
  key?: string
  scopes?: string[]
  enabled?: boolean
  expiresAt?: string | null
}

export interface CreateApiKeyV1Request {
  label: string
  scopes?: string[]
  expiresAt?: string | null
}

export interface UpdateApiKeyV1Request {
  label?: string
  scopes?: string[]
  enabled?: boolean
  expiresAt?: string | null
}

export type PatchApiKeyV1Request = PatchPayload

export const apiKeysV1Service = {
  list(query: PaginationQuery = {}) {
    return httpGet<PaginatedResponse<ApiKeyV1>>(API_KEYS_V1_BASE_PATH, { query })
  },
  count() {
    return httpGet<CountResponse>(`${API_KEYS_V1_BASE_PATH}/count`)
  },
  ids() {
    return httpGet<Id[]>(`${API_KEYS_V1_BASE_PATH}/ids`)
  },
  getById(id: Id) {
    return httpGet<ApiKeyV1>(`${API_KEYS_V1_BASE_PATH}/${id}`)
  },
  create(payload: CreateApiKeyV1Request) {
    return httpPost<ApiKeyV1, CreateApiKeyV1Request>(API_KEYS_V1_BASE_PATH, payload)
  },
  update(id: Id, payload: UpdateApiKeyV1Request) {
    return httpPut<ApiKeyV1, UpdateApiKeyV1Request>(`${API_KEYS_V1_BASE_PATH}/${id}`, payload)
  },
  patch(id: Id, payload: PatchApiKeyV1Request) {
    return httpPatch<ApiKeyV1, PatchApiKeyV1Request>(`${API_KEYS_V1_BASE_PATH}/${id}`, payload)
  },
  remove(id: Id) {
    return httpDelete<unknown>(`${API_KEYS_V1_BASE_PATH}/${id}`)
  },
}

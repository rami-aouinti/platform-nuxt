import { httpDelete, httpGet, httpPatch, httpPost, httpPut } from '../http/client'
import type {
  CountResponse,
  Id,
  PaginatedResponse,
  PaginationQuery,
  PatchPayload,
} from './_shared'

const API_KEYS_V2_BASE_PATH = '/api/v2/admin/api-keys'

export interface ApiKeyV2 {
  id: Id
  label: string
  publicKey?: string
  scopes?: string[]
  enabled?: boolean
  expiresAt?: string | null
  metadata?: Record<string, unknown>
}

export interface CreateApiKeyV2Request {
  label: string
  scopes?: string[]
  expiresAt?: string | null
  metadata?: Record<string, unknown>
}

export interface UpdateApiKeyV2Request {
  label?: string
  scopes?: string[]
  enabled?: boolean
  expiresAt?: string | null
  metadata?: Record<string, unknown>
}

export type PatchApiKeyV2Request = PatchPayload

export const apiKeysV2Service = {
  list(query: PaginationQuery = {}) {
    return httpGet<PaginatedResponse<ApiKeyV2>>(API_KEYS_V2_BASE_PATH, { query })
  },
  count() {
    return httpGet<CountResponse>(`${API_KEYS_V2_BASE_PATH}/count`)
  },
  ids() {
    return httpGet<Id[]>(`${API_KEYS_V2_BASE_PATH}/ids`)
  },
  getById(id: Id) {
    return httpGet<ApiKeyV2>(`${API_KEYS_V2_BASE_PATH}/${id}`)
  },
  create(payload: CreateApiKeyV2Request) {
    return httpPost<ApiKeyV2, CreateApiKeyV2Request>(API_KEYS_V2_BASE_PATH, payload)
  },
  update(id: Id, payload: UpdateApiKeyV2Request) {
    return httpPut<ApiKeyV2, UpdateApiKeyV2Request>(`${API_KEYS_V2_BASE_PATH}/${id}`, payload)
  },
  patch(id: Id, payload: PatchApiKeyV2Request) {
    return httpPatch<ApiKeyV2, PatchApiKeyV2Request>(`${API_KEYS_V2_BASE_PATH}/${id}`, payload)
  },
  remove(id: Id) {
    return httpDelete<unknown>(`${API_KEYS_V2_BASE_PATH}/${id}`)
  },
}

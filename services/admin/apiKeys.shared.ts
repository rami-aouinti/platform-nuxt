import { httpDelete, httpGet, httpPatch, httpPost, httpPut } from '../http/client'
import type {
  CountResponse,
  Id,
  PaginatedResponse,
  PaginationQuery,
  PatchPayload,
} from './_shared'

export interface BaseApiKey {
  id: Id
  label: string
  scopes?: string[]
  enabled?: boolean
  expiresAt?: string | null
}

export interface BaseCreateApiKeyRequest {
  label: string
  scopes?: string[]
  expiresAt?: string | null
  [key: string]: unknown
}

export interface BaseUpdateApiKeyRequest {
  label?: string
  scopes?: string[]
  enabled?: boolean
  expiresAt?: string | null
  [key: string]: unknown
}

export type BasePatchApiKeyRequest = PatchPayload

export function createApiKeysService<
  TApiKey extends BaseApiKey,
  TCreateRequest extends BaseCreateApiKeyRequest,
  TUpdateRequest extends BaseUpdateApiKeyRequest,
  TPatchRequest extends BasePatchApiKeyRequest,
>(basePath: string) {
  return {
    list(query: PaginationQuery = {}) {
      return httpGet<PaginatedResponse<TApiKey>>(basePath, { query })
    },
    count() {
      return httpGet<CountResponse>(`${basePath}/count`)
    },
    ids() {
      return httpGet<Id[]>(`${basePath}/ids`)
    },
    getById(id: Id) {
      return httpGet<TApiKey>(`${basePath}/${id}`)
    },
    create(payload: TCreateRequest) {
      return httpPost<TApiKey, TCreateRequest>(basePath, payload)
    },
    update(id: Id, payload: TUpdateRequest) {
      return httpPut<TApiKey, TUpdateRequest>(`${basePath}/${id}`, payload)
    },
    patch(id: Id, payload: TPatchRequest) {
      return httpPatch<TApiKey, TPatchRequest>(`${basePath}/${id}`, payload)
    },
    remove(id: Id) {
      return httpDelete<unknown>(`${basePath}/${id}`)
    },
  }
}

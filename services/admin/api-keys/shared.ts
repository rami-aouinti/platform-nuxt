import {
  createAdminCrudService,
  type AdminCrudService,
  type Id,
  type PatchPayload,
} from '../shared/index'

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
>(basePath: string): AdminCrudService<TApiKey, TCreateRequest, TUpdateRequest, TPatchRequest> {
  return createAdminCrudService<TApiKey, TCreateRequest, TUpdateRequest, TPatchRequest>(basePath)
}

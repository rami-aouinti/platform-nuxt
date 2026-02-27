import type { PatchPayload } from '../shared/index'
import {
  createApiKeysService,
  type BaseApiKey,
  type BaseCreateApiKeyRequest,
  type BaseUpdateApiKeyRequest,
} from './shared'

const API_KEYS_V1_BASE_PATH = '/api/v1/api_key'

export interface ApiKeyV1 extends BaseApiKey {
  key?: string
}

export type CreateApiKeyV1Request = BaseCreateApiKeyRequest

export type UpdateApiKeyV1Request = BaseUpdateApiKeyRequest

export type PatchApiKeyV1Request = PatchPayload

export const apiKeysV1Service = createApiKeysService<
  ApiKeyV1,
  CreateApiKeyV1Request,
  UpdateApiKeyV1Request,
  PatchApiKeyV1Request
>(API_KEYS_V1_BASE_PATH)

import type { PatchPayload } from '../_shared'
import {
  createApiKeysService,
  type BaseApiKey,
  type BaseCreateApiKeyRequest,
  type BaseUpdateApiKeyRequest,
} from './shared'

const API_KEYS_V2_BASE_PATH = '/api/v2/api_key'

export interface ApiKeyV2 extends BaseApiKey {
  publicKey?: string
  metadata?: Record<string, unknown>
}

export interface CreateApiKeyV2Request extends BaseCreateApiKeyRequest {
  metadata?: Record<string, unknown>
}

export interface UpdateApiKeyV2Request extends BaseUpdateApiKeyRequest {
  metadata?: Record<string, unknown>
}

export type PatchApiKeyV2Request = PatchPayload

export const apiKeysV2Service = createApiKeysService<
  ApiKeyV2,
  CreateApiKeyV2Request,
  UpdateApiKeyV2Request,
  PatchApiKeyV2Request
>(API_KEYS_V2_BASE_PATH)

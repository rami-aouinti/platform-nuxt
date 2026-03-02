import type { PatchPayload } from '../shared/index'
import {
  createApiKeysService,
  type BaseApiKey,
  type BaseCreateApiKeyRequest,
  type BaseUpdateApiKeyRequest,
} from './shared'

import { adminEndpoints } from '../endpoints'

const API_KEYS_V2_BASE_PATH = adminEndpoints.apiKeys.v2.base

export type ApiKeyV2 = BaseApiKey

export type CreateApiKeyV2Request = BaseCreateApiKeyRequest

export type UpdateApiKeyV2Request = BaseUpdateApiKeyRequest

export type PatchApiKeyV2Request = PatchPayload

export const apiKeysV2Service = createApiKeysService<
  ApiKeyV2,
  CreateApiKeyV2Request,
  UpdateApiKeyV2Request,
  PatchApiKeyV2Request
>(API_KEYS_V2_BASE_PATH)

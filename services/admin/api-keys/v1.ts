import type { PatchPayload } from '../shared/index'
import {
  createApiKeysService,
  type BaseApiKey,
  type BaseCreateApiKeyRequest,
  type BaseUpdateApiKeyRequest,
} from './shared'

import { adminEndpoints } from '../endpoints'

const API_KEYS_V1_BASE_PATH = adminEndpoints.apiKeys.v1.base

export type ApiKeyV1 = BaseApiKey

export type CreateApiKeyV1Request = BaseCreateApiKeyRequest

export type UpdateApiKeyV1Request = BaseUpdateApiKeyRequest

export type PatchApiKeyV1Request = PatchPayload

export const apiKeysV1Service = createApiKeysService<
  ApiKeyV1,
  CreateApiKeyV1Request,
  UpdateApiKeyV1Request,
  PatchApiKeyV1Request
>(API_KEYS_V1_BASE_PATH)

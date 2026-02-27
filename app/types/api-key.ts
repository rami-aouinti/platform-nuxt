export type ApiVersion = 'v1' | 'v2'

export interface ApiKey {
  id: string
  token: string
  description: string
}

export interface ApiKeyCountResponse {
  count: number
}

export interface CreateApiKeyPayload {
  token: string
  description: string
  [key: string]: unknown
}

export interface UpdateApiKeyPayload {
  token?: string
  description?: string
  [key: string]: unknown
}

export interface PatchApiKeyPayload {
  token?: string
  description?: string
  [key: string]: unknown
}

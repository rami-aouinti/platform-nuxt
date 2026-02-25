import { useRuntimeConfig } from '#imports'
import { useAuthStore } from '~/app/stores/auth'
import type { FetchContext, FetchOptions } from 'ofetch'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface HttpErrorPayload {
  statusCode: number
  message: string
  details?: unknown
}

export class HttpRequestError extends Error {
  statusCode: number
  details?: unknown

  constructor({ statusCode, message, details }: HttpErrorPayload) {
    super(message)
    this.name = 'HttpRequestError'
    this.statusCode = statusCode
    this.details = details
  }
}

function toHttpError(context: FetchContext & { response?: Response }) {
  const statusCode = context.response?.status ?? 500
  const details = context.error?.data ?? context.response?._data

  if (statusCode === 401) {
    return new HttpRequestError({
      statusCode,
      message: 'Session invalide. Veuillez vous reconnecter.',
      details,
    })
  }

  if (statusCode === 403) {
    return new HttpRequestError({
      statusCode,
      message: 'Accès refusé pour cette action.',
      details,
    })
  }

  if (statusCode >= 500) {
    return new HttpRequestError({
      statusCode,
      message: 'Erreur serveur. Réessayez plus tard.',
      details,
    })
  }

  return new HttpRequestError({
    statusCode,
    message: context.error?.message ?? 'Erreur de requête HTTP.',
    details,
  })
}

const apiClient = $fetch.create({
  onRequest({ options }) {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()

    options.baseURL = config.public.authApiBase

    const token = authStore.token
    if (!token) {
      return
    }

    options.headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    }
  },
  onResponseError(context) {
    throw toHttpError(context)
  },
})

export function httpRequest<T>(
  method: HttpMethod,
  url: string,
  options: FetchOptions<'json'> = {},
) {
  return apiClient<T>(url, {
    ...options,
    method,
  })
}

export function httpGet<T>(url: string, options: FetchOptions<'json'> = {}) {
  return httpRequest<T>('GET', url, options)
}

export function httpPost<TResponse, TBody>(
  url: string,
  body: TBody,
  options: FetchOptions<'json'> = {},
) {
  return httpRequest<TResponse>('POST', url, {
    ...options,
    body,
  })
}

export function httpPut<TResponse, TBody>(
  url: string,
  body: TBody,
  options: FetchOptions<'json'> = {},
) {
  return httpRequest<TResponse>('PUT', url, {
    ...options,
    body,
  })
}

export function httpPatch<TResponse, TBody>(
  url: string,
  body: TBody,
  options: FetchOptions<'json'> = {},
) {
  return httpRequest<TResponse>('PATCH', url, {
    ...options,
    body,
  })
}

export function httpDelete<TResponse>(
  url: string,
  options: FetchOptions<'json'> = {},
) {
  return httpRequest<TResponse>('DELETE', url, options)
}

import { navigateTo, useRuntimeConfig } from '#imports'
import { useAuthStore } from '~/stores/auth'
import { Notify } from '~/stores/notification'
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

type StandardApiError = {
  message?: string
  error?: string
  details?: unknown
  errors?: unknown
}

function extractStandardErrorPayload(context: FetchContext & { response?: Response }) {
  const payload =
    (context.error as { data?: unknown } | undefined)?.data ?? context.response?._data

  if (!payload || typeof payload !== 'object') {
    return { message: undefined, details: payload }
  }

  const typedPayload = payload as StandardApiError
  return {
    message: typedPayload.message ?? typedPayload.error,
    details: typedPayload.details ?? typedPayload.errors ?? payload,
  }
}

function toHttpError(context: FetchContext & { response?: Response }) {
  const statusCode = context.response?.status ?? 500
  const standardError = extractStandardErrorPayload(context)

  if (statusCode === 401) {
    return new HttpRequestError({
      statusCode,
      message: standardError.message ?? 'Session invalide. Veuillez vous reconnecter.',
      details: standardError.details,
    })
  }

  if (statusCode === 403) {
    return new HttpRequestError({
      statusCode,
      message: standardError.message ?? 'Accès refusé pour cette action.',
      details: standardError.details,
    })
  }

  if (statusCode >= 500) {
    return new HttpRequestError({
      statusCode,
      message: standardError.message ?? 'Erreur serveur. Réessayez plus tard.',
      details: standardError.details,
    })
  }

  return new HttpRequestError({
    statusCode,
    message: standardError.message ?? context.error?.message ?? 'Erreur de requête HTTP.',
    details: standardError.details,
  })
}

function handleGlobalHttpError(error: HttpRequestError) {
  if (!import.meta.client) {
    return
  }

  const authStore = useAuthStore()

  if (error.statusCode === 401) {
    authStore.logout()
    Notify.error('Session expirée. Veuillez vous reconnecter.')
    void navigateTo('/login')
    return
  }

  if (error.statusCode === 403) {
    Notify.error('Accès refusé pour cette action.')
    void navigateTo('/403?reason=unauthorized')
  }
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

    const headers = new Headers(
      (options.headers ?? undefined) as HeadersInit | undefined,
    )
    headers.set('Authorization', `Bearer ${token}`)
    options.headers = headers
  },
  onResponseError(context) {
    const error = toHttpError(context)
    handleGlobalHttpError(error)
    throw error
  },
})

export function httpRequest<T>(
  method: HttpMethod,
  url: string,
  options: FetchOptions = {},
) {
  return (apiClient as any)(url, {
    ...(options as FetchOptions),
    method: method.toLowerCase(),
  }) as Promise<T>
}

export function httpGet<T>(url: string, options: FetchOptions = {}) {
  return httpRequest<T>('GET', url, options)
}

export function httpPost<TResponse, TBody>(
  url: string,
  body: TBody,
  options: FetchOptions = {},
) {
  return httpRequest<TResponse>('POST', url, {
    ...options,
    body: body as FetchOptions['body'],
  })
}

export function httpPut<TResponse, TBody>(
  url: string,
  body: TBody,
  options: FetchOptions = {},
) {
  return httpRequest<TResponse>('PUT', url, {
    ...options,
    body: body as FetchOptions['body'],
  })
}

export function httpPatch<TResponse, TBody>(
  url: string,
  body: TBody,
  options: FetchOptions = {},
) {
  return httpRequest<TResponse>('PATCH', url, {
    ...options,
    body: body as FetchOptions['body'],
  })
}

export function httpDelete<TResponse>(url: string, options: FetchOptions = {}) {
  return httpRequest<TResponse>('DELETE', url, options)
}

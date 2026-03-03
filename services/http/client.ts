import { navigateTo } from '#imports'
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


let isUnauthorizedHandlingInProgress = false

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
    if (!authStore.token) {
      void navigateTo('/login')
      return
    }

    if (isUnauthorizedHandlingInProgress) {
      return
    }

    isUnauthorizedHandlingInProgress = true

    void authStore.logout().finally(() => {
      isUnauthorizedHandlingInProgress = false
    })

    Notify.error('Session expirée. Veuillez vous reconnecter.')
    void navigateTo('/login')
    return
  }

  if (error.statusCode === 403) {
    Notify.error('Accès refusé pour cette action.')
    void navigateTo('/403?reason=unauthorized')
  }
}

function readTokenFromCookie() {
  if (!import.meta.client) {
    return null
  }

  const tokenCookie = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith('auth_token='))

  if (!tokenCookie) {
    return null
  }

  const value = tokenCookie.slice('auth_token='.length)

  if (!value) {
    return null
  }

  return decodeURIComponent(value)
}

const apiClient = $fetch.create({
  onRequest({ options }) {
    const authStore = useAuthStore()

    // Route all app API calls through Nuxt server endpoints (/api/*),
    // which proxy to the upstream auth API with consistent auth handling.
    options.baseURL = ''

    const token = authStore.token ?? readTokenFromCookie()
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

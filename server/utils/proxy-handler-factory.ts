import {
  createError,
  defineEventHandler,
  getMethod,
  getQuery,
  getRouterParam,
  type EventHandler,
  type H3Event,
} from 'h3'
import { proxyAuthApiGet, proxyAuthApiRequest } from './auth-api-proxy'
import { buildQuerySuffix } from './query-string'
import { requireAuthenticatedRequest } from './require-auth'
import { buildQuerySuffixFromQuery } from './upstream-query'

type ProxyHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ProxyCollectionHandlerOptions {
  upstreamPath: string
  method: ProxyHttpMethod
}

interface ProxyCollectionHandlerWithQueryOptions {
  upstreamBasePath: string
}

interface ProxyEntityHandlerOptions {
  paramName: string
  upstreamPathBuilder: (paramValue: string) => string
  method: ProxyHttpMethod
  missingParamError?: {
    statusMessage: string
    message: string
  }
}

function isSupportedMethod(method: string): method is ProxyHttpMethod {
  return method === 'GET' || method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE'
}

function normalizeCatchAllPath(pathParam: string | string[] | undefined) {
  return Array.isArray(pathParam) ? pathParam.join('/') : (pathParam ?? '')
}

export function validateRequiredRouteParam(
  event: H3Event,
  paramName: string,
  missingParamError?: ProxyEntityHandlerOptions['missingParamError'],
): string {
  const paramValue = getRouterParam(event, paramName)

  if (paramValue) {
    return paramValue
  }

  throw createError({
    statusCode: 400,
    statusMessage: missingParamError?.statusMessage ?? `Invalid ${paramName} parameter.`,
    message: missingParamError?.message ?? `Route parameter "${paramName}" is required.`,
  })
}

function proxyRequestByMethod(event: H3Event, path: string, method: ProxyHttpMethod) {
  if (method === 'GET') {
    return proxyAuthApiGet(event, path)
  }

  return proxyAuthApiRequest(event, path, method)
}

export function createProxyCollectionHandler(
  options: ProxyCollectionHandlerOptions,
): EventHandler {
  const { upstreamPath, method } = options

  return defineEventHandler(async (event) => {
    return await proxyRequestByMethod(event, upstreamPath, method)
  })
}

export function createProxyCollectionHandlerWithQuery(
  options: ProxyCollectionHandlerWithQueryOptions,
): EventHandler {
  const { upstreamBasePath } = options

  return defineEventHandler(async (event) => {
    const suffix = buildQuerySuffix(event)
    return await proxyAuthApiGet(event, `${upstreamBasePath}${suffix}`)
  })
}

export function createProxyEntityHandler(options: ProxyEntityHandlerOptions): EventHandler {
  const { paramName, upstreamPathBuilder, method, missingParamError } = options

  return defineEventHandler(async (event) => {
    const paramValue = validateRequiredRouteParam(event, paramName, missingParamError)
    const path = upstreamPathBuilder(paramValue)

    return await proxyRequestByMethod(event, path, method)
  })
}

export function createVersionedCatchAllProxyHandler(version: 'v1' | 'v2'): EventHandler {
  return defineEventHandler(async (event) => {
    const method = getMethod(event).toUpperCase()

    if (!isSupportedMethod(method)) {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed',
        message: `Unsupported method: ${method}`,
      })
    }

    const normalizedPath = normalizeCatchAllPath(getRouterParam(event, 'path'))

    if (!normalizedPath) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid API path.',
        message: 'A target API path is required.',
      })
    }

    if (normalizedPath.startsWith('auth/')) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'Auth endpoints are handled by dedicated routes.',
      })
    }

    requireAuthenticatedRequest(event)

    const suffix = buildQuerySuffixFromQuery(getQuery(event))
    const upstreamPath = `/api/${version}/${normalizedPath}${suffix}`

    return await proxyAuthApiRequest(event, upstreamPath, method)
  })
}

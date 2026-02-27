import { createError, defineEventHandler, getRouterParam, type EventHandler, type H3Event } from 'h3'
import { proxyAuthApiGet, proxyAuthApiRequest } from './auth-api-proxy'

type ProxyHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ProxyCollectionHandlerOptions {
  upstreamPath: string
  method: ProxyHttpMethod
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

export function createProxyEntityHandler(options: ProxyEntityHandlerOptions): EventHandler {
  const { paramName, upstreamPathBuilder, method, missingParamError } = options

  return defineEventHandler(async (event) => {
    const paramValue = validateRequiredRouteParam(event, paramName, missingParamError)
    const path = upstreamPathBuilder(paramValue)

    return await proxyRequestByMethod(event, path, method)
  })
}

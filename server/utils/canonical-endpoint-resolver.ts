import { isError, type H3Event } from 'h3'
import {
  API_CANONICAL_ENDPOINT_MAP,
  type CanonicalResourceKey,
  type ProxyHttpMethod,
  getOrderedCandidateEndpoints,
} from './api-canonical-map'
import { proxyAuthApiRequest } from './auth-api-proxy'

function logDeprecatedAliasUsage(resource: CanonicalResourceKey, alias: string) {
  const config = API_CANONICAL_ENDPOINT_MAP[resource]

  console.warn(
    `[api-deprecation] Legacy alias "${alias}" used for resource "${resource}". ` +
      `Canonical endpoint: "${config.canonical}". ` +
      `Warning window until ${config.deprecation.warnUntil}, removal after ${config.deprecation.removalAfter}. ` +
      `${config.deprecation.note}`,
  )
}

export async function proxyAuthApiCanonical(
  event: H3Event,
  resource: CanonicalResourceKey,
  method: ProxyHttpMethod,
) {
  const endpoints = getOrderedCandidateEndpoints(resource)
  let lastError: unknown

  for (const endpoint of endpoints) {
    try {
      const response = await proxyAuthApiRequest(event, endpoint, method)

      if (endpoint !== API_CANONICAL_ENDPOINT_MAP[resource].canonical) {
        logDeprecatedAliasUsage(resource, endpoint)
      }

      return response
    }
    catch (error) {
      lastError = error

      if (!isError(error) || error.statusCode !== 404) {
        throw error
      }
    }
  }

  throw lastError
}

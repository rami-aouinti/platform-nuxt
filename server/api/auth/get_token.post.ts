import type { H3Event } from 'h3'
import { getAuthApiUpstreamCandidates } from '../../utils/auth-api-upstream'
import {
  LONG_LIVED_PROFILE_CACHE_TTL_MS,
  writeProfileEndpointCache,
} from '../../utils/profile-endpoint-cache'
import {
  normalizeProfileGroups,
  normalizeProfileRoles,
} from '../../utils/profile-response-normalizers'

const GROUPS_CACHE_KEY = 'profile-groups'
const ROLES_CACHE_KEY = 'profile-roles'

function isSecureCookie(event: H3Event) {
  const forwardedProto = getHeader(event, 'x-forwarded-proto')

  if (forwardedProto) {
    return forwardedProto.split(',')[0]?.trim().toLowerCase() === 'https'
  }

  const host = getHeader(event, 'host') ?? ''
  return !host.includes('localhost') && !host.includes('127.0.0.1')
}


function normalizeBearerToken(rawToken: string | undefined) {
  if (!rawToken) {
    return undefined
  }

  const trimmed = rawToken.trim()
  if (!trimmed) {
    return undefined
  }

  return trimmed.replace(/^Bearer\s+/i, '')
}

function clearLegacyClientCookie(event: H3Event, secure: boolean) {
  deleteCookie(event, 'auth_token', {
    path: '/',
    sameSite: 'lax',
    secure,
    maxAge: 0,
  })
}

async function warmAuthGroupsAndRolesCache(event: H3Event, baseURL: string, token: string) {
  const authorization = `Bearer ${token}`

  event.node.req.headers.authorization = authorization

  const [groupsResult, rolesResult] = await Promise.allSettled([
    $fetch('/api/v1/profile/groups', {
      baseURL,
      headers: { Authorization: authorization },
    }),
    $fetch('/api/v1/profile/roles', {
      baseURL,
      headers: { Authorization: authorization },
    }),
  ])

  if (groupsResult.status === 'fulfilled') {
    await writeProfileEndpointCache(
      event,
      GROUPS_CACHE_KEY,
      normalizeProfileGroups(groupsResult.value),
      { ttlMs: LONG_LIVED_PROFILE_CACHE_TTL_MS },
    )
  }

  if (rolesResult.status === 'fulfilled') {
    await writeProfileEndpointCache(
      event,
      ROLES_CACHE_KEY,
      normalizeProfileRoles(rolesResult.value),
      { ttlMs: LONG_LIVED_PROFILE_CACHE_TTL_MS },
    )
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string, password?: string }>(event)

  if (!body?.username || !body?.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing credentials.',
    })
  }

  const upstreamCandidates = getAuthApiUpstreamCandidates(event)

  let lastError: unknown

  for (const baseURL of upstreamCandidates) {
    try {
      const response = await $fetch<{ token?: string }>('/api/v1/auth/get_token', {
        baseURL,
        method: 'POST',
        body,
      })

      const token = normalizeBearerToken(response?.token)
      const secure = isSecureCookie(event)

      if (token) {
        setCookie(event, 'auth_token', encodeURIComponent(token), {
          path: '/',
          httpOnly: true,
          secure,
          sameSite: 'lax',
          maxAge: 60 * 60 * 8,
        })

        await warmAuthGroupsAndRolesCache(event, baseURL, token)
      }
      else {
        clearLegacyClientCookie(event, secure)
      }

      return token ? { ...response, token } : response
    }
    catch (error) {
      lastError = error
    }
  }

  const errorMessage = lastError instanceof Error ? lastError.message : 'fetch failed'

  throw createError({
    statusCode: 502,
    statusMessage: 'Upstream auth API unreachable.',
    message: errorMessage,
  })
})

import type { H3Event } from 'h3'
import { createHash } from 'node:crypto'
import Redis from 'ioredis'

type ProfileCacheValue = {
  payload: unknown
}

type RedisConnectionOptions = {
  url?: string
  host?: string
  port?: number
  password?: string
}

let redisClient: Redis | null = null
let redisUnavailable = false

function resolveRedisOptions(event: H3Event): RedisConnectionOptions {
  const config = useRuntimeConfig(event)

  return {
    url: config.redisUrl,
    host: config.redisHost || undefined,
    port: config.redisPort ? Number(config.redisPort) : undefined,
    password: config.redisPassword || undefined,
  }
}

function getRedisClient(event: H3Event): Redis | null {
  if (redisUnavailable) {
    return null
  }

  if (redisClient) {
    return redisClient
  }

  const { url, host, port, password } = resolveRedisOptions(event)
  const resolvedPort =
    Number.isFinite(port ?? NaN) && (port ?? 0) > 0 ? (port as number) : 6379

  if (!url && !host) {
    redisUnavailable = true
    return null
  }

  try {
    redisClient = url
      ? new Redis(url)
      : new Redis({
          host,
          port: resolvedPort,
          password: password || undefined,
        })

    redisClient.on('error', (error) => {
      console.error('[profile-cache] redis client error', error)
    })

    return redisClient
  } catch (error) {
    console.error('[profile-cache] redis client init failed', error)
    redisUnavailable = true
    return null
  }
}

export function buildProfileCacheKey(event: H3Event, key: string): string {
  const authorization = getHeader(event, 'authorization') ?? 'anonymous'
  const hashToken = createHash('sha256').update(authorization).digest('hex')

  return `profile:${hashToken}:${key}`
}

export async function getProfileCache(
  event: H3Event,
  key: string,
): Promise<unknown | null> {
  const client = getRedisClient(event)

  if (!client) {
    return null
  }

  try {
    const value = await client.get(key)

    if (!value) {
      return null
    }

    const parsed = JSON.parse(value) as ProfileCacheValue

    if (!parsed || typeof parsed !== 'object' || !('payload' in parsed)) {
      return null
    }

    return parsed.payload
  } catch (error) {
    console.error('[profile-cache] get failed', error)
    return null
  }
}

export async function setProfileCache(
  event: H3Event,
  key: string,
  payload: unknown,
  ttlMs: number,
): Promise<void> {
  const client = getRedisClient(event)

  if (!client) {
    return
  }

  try {
    const serialized = JSON.stringify({ payload } satisfies ProfileCacheValue)
    await client.set(key, serialized, 'PX', Math.max(1, ttlMs))
  } catch (error) {
    console.error('[profile-cache] set failed', error)
  }
}

export async function delProfileCache(
  event: H3Event,
  key: string,
): Promise<void> {
  const client = getRedisClient(event)

  if (!client) {
    return
  }

  try {
    await client.del(key)
  } catch (error) {
    console.error('[profile-cache] del failed', error)
  }
}

import { resolveProfileCacheRuntimeStatus } from '../utils/cache/profile-cache'

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig()
  const status = resolveProfileCacheRuntimeStatus(config)

  if (status.enabled) {
    console.info(
      `[profile-cache] startup status=enabled mode=${status.mode} ttlMs=${status.ttlMs} fallback=${status.fallbackBehavior}`,
    )
    return
  }

  console.info(
    `[profile-cache] startup status=disabled reason=${status.reason ?? 'unknown'} ttlMs=${status.ttlMs} fallback=${status.fallbackBehavior}`,
  )
})

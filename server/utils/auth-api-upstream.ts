import type { H3Event } from 'h3'

function shouldAllowLocalAuthApiFallback() {
  if (process.env.NUXT_AUTH_API_ALLOW_LOCAL_FALLBACK === '1') {
    return true
  }

  return process.env.NODE_ENV !== 'production'
}

export function getAuthApiUpstreamCandidates(event: H3Event): string[] {
  const config = useRuntimeConfig(event)
  const upstreamCandidates = [
    config.authApiBase,
    config.public.authApiBase,
  ]

  if (shouldAllowLocalAuthApiFallback()) {
    upstreamCandidates.push('http://host.docker.internal', 'http://localhost')
  }

  return upstreamCandidates.filter((value, index, values): value is string => {
    return Boolean(value) && values.indexOf(value) === index
  })
}

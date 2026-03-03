import type { H3Event } from 'h3'

export function getAuthApiUpstreamCandidates(event: H3Event): string[] {
  const config = useRuntimeConfig(event)
  const upstreamCandidates = [
    config.authApiBase,
    config.public.authApiBase,
  ]

  return upstreamCandidates.filter((value, index, values): value is string => {
    return Boolean(value) && values.indexOf(value) === index
  })
}

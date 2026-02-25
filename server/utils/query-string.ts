import type { H3Event } from 'h3'
import { buildQuerySuffixFromQuery } from './upstream-query'

export function buildQuerySuffix(event: H3Event) {
  const query = getQuery(event)
  return buildQuerySuffixFromQuery(query)
}

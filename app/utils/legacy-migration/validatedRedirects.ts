export const parityChecklistKeys = [
  'navigation',
  'forms',
  'tables',
  'i18n',
  'responsive',
  'permissions',
] as const

export type ParityChecklistKey = (typeof parityChecklistKeys)[number]

export type LegacyRedirectEntry = {
  domain: string
  legacyRoute: `/legacy/${string}`
  targetRoute: `/${string}`
  statusCode: 301 | 302
  parityChecklist: Record<ParityChecklistKey, true>
  validatedAt: string
  migrationTicket: `MIG-${string}`
  uxValidationTicket: `UX-${string}`
}

/**
 * Add redirects to this list only after UX validation is complete.
 */
export const validatedLegacyRedirects: LegacyRedirectEntry[] = []

export function getLegacyRedirect(pathname: string): LegacyRedirectEntry | undefined {
  return validatedLegacyRedirects.find((entry) => entry.legacyRoute === pathname)
}

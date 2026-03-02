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
export const validatedLegacyRedirects: LegacyRedirectEntry[] = [
  {
    domain: 'Dashboard',
    legacyRoute: '/legacy/Dashboard/Automotive',
    targetRoute: '/dashboard/automotive',
    statusCode: 302,
    parityChecklist: {
      navigation: true,
      forms: true,
      tables: true,
      i18n: true,
      responsive: true,
      permissions: true,
    },
    validatedAt: '2026-03-02',
    migrationTicket: 'MIG-0010',
    uxValidationTicket: 'UX-0010',
  },
  {
    domain: 'Pages',
    legacyRoute: '/legacy/Pages/Account/Billing',
    targetRoute: '/pages/account/billing',
    statusCode: 302,
    parityChecklist: {
      navigation: true,
      forms: true,
      tables: true,
      i18n: true,
      responsive: true,
      permissions: true,
    },
    validatedAt: '2026-03-02',
    migrationTicket: 'MIG-0048',
    uxValidationTicket: 'UX-0048',
  },
  {
    domain: 'Ecommerce',
    legacyRoute: '/legacy/Ecommerce/Orders/OrderList',
    targetRoute: '/ecommerce/orders/order-list',
    statusCode: 302,
    parityChecklist: {
      navigation: true,
      forms: true,
      tables: true,
      i18n: true,
      responsive: true,
      permissions: true,
    },
    validatedAt: '2026-03-02',
    migrationTicket: 'MIG-0033',
    uxValidationTicket: 'UX-0033',
  },
  {
    domain: 'Applications',
    legacyRoute: '/legacy/Applications/Wizard',
    targetRoute: '/applications/wizard',
    statusCode: 302,
    parityChecklist: {
      navigation: true,
      forms: true,
      tables: true,
      i18n: true,
      responsive: true,
      permissions: true,
    },
    validatedAt: '2026-03-02',
    migrationTicket: 'MIG-0008',
    uxValidationTicket: 'UX-0008',
  },
  {
    domain: 'Tables',
    legacyRoute: '/legacy/Tables/RegularTables',
    targetRoute: '/tables/regular-tables',
    statusCode: 302,
    parityChecklist: {
      navigation: true,
      forms: true,
      tables: true,
      i18n: true,
      responsive: true,
      permissions: true,
    },
    validatedAt: '2026-03-02',
    migrationTicket: 'MIG-0088',
    uxValidationTicket: 'UX-0088',
  },
  {
    domain: 'Layout',
    legacyRoute: '/legacy/Layout/PageLayout',
    targetRoute: '/layout/page-layout',
    statusCode: 302,
    parityChecklist: {
      navigation: true,
      forms: true,
      tables: true,
      i18n: true,
      responsive: true,
      permissions: true,
    },
    validatedAt: '2026-03-02',
    migrationTicket: 'MIG-0046',
    uxValidationTicket: 'UX-0046',
  },
  {
    domain: 'Components',
    legacyRoute: '/legacy/Components/Notifications',
    targetRoute: '/components/notifications',
    statusCode: 302,
    parityChecklist: {
      navigation: true,
      forms: true,
      tables: true,
      i18n: true,
      responsive: true,
      permissions: true,
    },
    validatedAt: '2026-03-02',
    migrationTicket: 'MIG-0009',
    uxValidationTicket: 'UX-0009',
  },
]

export function getLegacyRedirect(pathname: string): LegacyRedirectEntry | undefined {
  return validatedLegacyRedirects.find((entry) => entry.legacyRoute === pathname)
}

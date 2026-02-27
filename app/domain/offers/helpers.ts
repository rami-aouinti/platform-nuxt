import type { JobApplication } from '../../../services/admin/job-applications/index'
import type { JobOffer } from '../../../services/admin/job-offers/index'

export type FilterSelection = Record<string, string[]>

export interface NormalizedListQueryOptions {
  selectedFilters?: FilterSelection
  search?: string
  sort?: string
  page?: number
  pageSize?: number
  extraWhere?: Record<string, string | number | undefined>
}

export function toCollectionArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (!payload || typeof payload !== 'object') return []

  const objectPayload = payload as {
    data?: unknown
    items?: unknown
    member?: unknown
    'hydra:member'?: unknown
  }

  const collection =
    objectPayload.data ??
    objectPayload.items ??
    objectPayload.member ??
    objectPayload['hydra:member']

  return Array.isArray(collection) ? (collection as T[]) : []
}

export function normalizeListQuery({
  selectedFilters = {},
  search,
  sort,
  page = 1,
  pageSize = 10,
  extraWhere = {},
}: NormalizedListQueryOptions) {
  const whereFromFilters = Object.fromEntries(
    Object.entries(selectedFilters).map(([key, values]) => [key, values?.[0]]),
  )

  const where = Object.fromEntries(
    Object.entries({ ...whereFromFilters, ...extraWhere }).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  )

  return {
    where,
    order: sort,
    limit: pageSize,
    offset: Math.max(page - 1, 0) * pageSize,
    ...(search?.trim() ? { search: search.trim() } : {}),
  }
}

export function asLabel(value: unknown) {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return undefined

  const typedValue = value as Record<string, unknown>
  const label = typedValue.name ?? typedValue.title ?? typedValue.code
  return typeof label === 'string' ? label : undefined
}

export function resolveCompanyName(offer: JobOffer) {
  if (typeof offer.company === 'string') return offer.companyName || offer.company

  const typedCompany = offer.company as {
    id?: string
    name?: string
    legalName?: string
  }

  return (
    offer.companyName ||
    typedCompany?.name ||
    typedCompany?.legalName ||
    String(typedCompany?.id || '')
  )
}

export function formatEmploymentType(offer: JobOffer) {
  const key = offer.employmentType || offer.workTime
  const labels: Record<string, string> = {
    'full-time': 'Vollzeit',
    'part-time': 'Teilzeit',
    freelance: 'Freelance',
    intern: 'Praktikum',
    contract: 'Befristet',
  }
  return key ? labels[key] || key : 'Vollzeit'
}

export function formatSalary(offer: JobOffer) {
  if (!offer.salaryMin && !offer.salaryMax) return 'Gehalt auf Anfrage'

  const currency = offer.salaryCurrency || 'EUR'
  const min =
    typeof offer.salaryMin === 'number'
      ? offer.salaryMin.toLocaleString('de-DE')
      : undefined
  const max =
    typeof offer.salaryMax === 'number'
      ? offer.salaryMax.toLocaleString('de-DE')
      : undefined
  const range = min && max ? `${min} - ${max}` : min || max || ''

  const periodMap: Record<string, string> = {
    yearly: ' / an',
    monthly: ' / mois',
    weekly: ' / semaine',
    daily: ' / jour',
    hourly: ' / heure',
  }

  return `${range} ${currency}${periodMap[offer.salaryPeriod || 'yearly'] || ''}`.trim()
}

export function formatRelativeDate(input?: string) {
  if (!input) return undefined

  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return undefined

  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return "Aujourd'hui"
  if (days === 1) return 'Hier'
  if (days < 7) return `Il y a ${days} jours`

  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `Il y a ${weeks} sem.`

  return new Intl.DateTimeFormat('fr-FR').format(date)
}

export function applicationStatusMeta(status: JobApplication['status'] | string = 'pending') {
  if (status === 'accepted') return { label: 'Acceptée', tone: 'success' as const }
  if (status === 'rejected') return { label: 'Rejetée', tone: 'error' as const }
  if (status === 'withdrawn') return { label: 'Retirée', tone: 'neutral' as const }
  return { label: 'En attente', tone: 'warning' as const }
}

export function canWithdrawApplication(row: JobApplication) {
  return row.status === 'pending'
}

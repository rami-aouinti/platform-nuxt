<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { Notify } from '~/stores/notification'
import { httpGet, HttpRequestError } from '../../../services/http/client'
import { jobApplicationsService } from '../../../services/admin/job-applications'
import type { JobOffer } from '../../../services/admin/job-offers/index'

definePageMeta({
  icon: 'mdi-briefcase-search-outline',
  title: 'Offres disponibles',
  drawerIndex: 20,
  requiresAuth: true,
  middleware: ['auth'],
})

const rows = ref<JobOffer[]>([])
const loading = ref(false)
const actionLoading = ref(false)
const error = ref<string | null>(null)
const forbidden = ref(false)
const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const location = ref('')
const selectedId = ref<string>('')
const favorites = ref<string[]>([])
const mobileFilters = ref(false)
const selectedFilters = ref<Record<string, string[]>>({})

const { mdAndDown } = useDisplay()

const filterSections = [
  {
    key: 'employmentType',
    title: 'Anstellungsart',
    items: [
      { label: 'Vollzeit', value: 'full-time' },
      { label: 'Teilzeit', value: 'part-time' },
      { label: 'Freelance', value: 'freelance' },
    ],
  },
  {
    key: 'remoteMode',
    title: 'Arbeitsmodell',
    items: [
      { label: 'Remote', value: 'remote' },
      { label: 'Hybrid', value: 'hybrid' },
      { label: 'Vor Ort', value: 'onsite' },
    ],
  },
  {
    key: 'publishedWithinDays',
    title: 'Publication',
    items: [
      { label: '24h', value: '1' },
      { label: '7 jours', value: '7' },
      { label: '30 jours', value: '30' },
    ],
  },
]

const pageState = computed(() => {
  if (forbidden.value) return 'forbidden'
  if (error.value) return 'error'
  if (loading.value) return 'loading'
  if (!rows.value.length) return 'empty'
  return 'ready'
})

function firstFilter(key: string) {
  return selectedFilters.value[key]?.[0]
}

function resolveCompanyName(offer: JobOffer) {
  if (typeof offer.company === 'string')
    return offer.companyName || offer.company
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

function asLabel(value: unknown) {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return undefined

  const typedValue = value as Record<string, unknown>
  const label = typedValue.name ?? typedValue.title ?? typedValue.code
  return typeof label === 'string' ? label : undefined
}

function toOffersArray(payload: unknown): JobOffer[] {
  if (Array.isArray(payload)) return payload as JobOffer[]
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

  return Array.isArray(collection) ? (collection as JobOffer[]) : []
}

function formatEmploymentType(offer: JobOffer) {
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

function formatSalary(offer: JobOffer) {
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

function formatRelativeDate(input?: string) {
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

const mappedOffers = computed(() =>
  rows.value.map((row, index) => ({
    id: String(row.id),
    title: row.title,
    company: resolveCompanyName(row),
    matchingScore: 76 + (index % 4) * 5,
    matchingLabel: 'Passt hervorragend',
    location:
      row.location ||
      [asLabel(row.city), asLabel(row.region)].filter(Boolean).join(', ') ||
      location.value ||
      'Standort flexibel',
    workMode: row.remoteMode || formatEmploymentType(row),
    salary: formatSalary(row),
    publishedAtLabel: formatRelativeDate(row.publishedAt),
    tags: [
      asLabel(row.jobCategory),
      ...(row.skills || [])
        .slice(0, 2)
        .map((value) => asLabel(value))
        .filter(Boolean),
      ...(row.languages || [])
        .slice(0, 1)
        .map((value) => asLabel(value))
        .filter(Boolean),
    ].filter(Boolean) as string[],
    status: row.status === 'open' ? 'Offen' : row.status,
  })),
)

const selectedOffer = computed(
  () =>
    mappedOffers.value.find((offer) => offer.id === selectedId.value) ??
    mappedOffers.value[0],
)

function toErrorMessage(errorValue: unknown) {
  if (errorValue instanceof HttpRequestError) return errorValue.message
  if (errorValue instanceof Error) return errorValue.message
  return 'Erreur API.'
}

async function loadRows() {
  loading.value = true
  error.value = null
  forbidden.value = false

  try {
    const where = {
      status: 'open',
      location: location.value || undefined,
      remoteMode: firstFilter('remoteMode'),
      employmentType: firstFilter('employmentType'),
      salaryMin: firstFilter('salaryMin'),
      salaryMax: firstFilter('salaryMax'),
      skills: firstFilter('skills'),
      languages: firstFilter('languages'),
      city: firstFilter('city'),
      region: firstFilter('region'),
      jobCategory: firstFilter('jobCategory'),
      publishedWithinDays: firstFilter('publishedWithinDays'),
    }

    const normalizedWhere = Object.fromEntries(
      Object.entries(where).filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
      ),
    )

    const data = await httpGet<unknown>('/api/job-offers', {
      query: {
        where: JSON.stringify(normalizedWhere),
        order: 'publishedAt:desc',
        limit: pageSize.value,
        offset: Math.max(page.value - 1, 0) * pageSize.value,
        ...(search.value.trim() ? { search: search.value.trim() } : {}),
      },
    })

    rows.value = toOffersArray(data)
    const firstOffer = rows.value.at(0)
    if (!selectedId.value && firstOffer) {
      selectedId.value = String(firstOffer.id)
    }
  } catch (errorValue) {
    if (
      errorValue instanceof HttpRequestError &&
      errorValue.statusCode === 403
    ) {
      forbidden.value = true
      return
    }

    error.value = toErrorMessage(errorValue)
  } finally {
    loading.value = false
  }
}

async function apply(offerId: string) {
  actionLoading.value = true
  try {
    await jobApplicationsService.apply(offerId)
    Notify.success('Candidature envoyée.')
  } catch (errorValue) {
    Notify.error(toErrorMessage(errorValue))
  } finally {
    actionLoading.value = false
  }
}

function toggleFavorite(offerId: string) {
  favorites.value = favorites.value.includes(offerId)
    ? favorites.value.filter((id) => id !== offerId)
    : [...favorites.value, offerId]
}

watch([page, pageSize], loadRows)
watchDebounced(
  [search, location, selectedFilters],
  () => {
    page.value = 1
    void loadRows()
  },
  { debounce: 300, maxWait: 1000 },
)

onMounted(loadRows)
</script>

<template>
  <main class="offers-board-page">
    <OffersSearchBar
      v-model:query="search"
      v-model:location="location"
      app-bar-teleport
      @search="loadRows"
    />

    <OffersFiltersSidebar
      v-if="!mdAndDown"
      v-model="selectedFilters"
      title="Filter"
      horizontal
      :sections="filterSections"
    />

    <div class="offers-board-page__layout">
      <section class="offers-board-page__content">
        <div v-if="mdAndDown" class="offers-board-page__mobile-tools">
          <v-btn
            variant="outlined"
            prepend-icon="mdi-filter-variant"
            @click="mobileFilters = true"
            >Filter</v-btn
          >
        </div>

        <v-alert v-if="pageState === 'forbidden'" type="error" variant="tonal"
          >403 · Accès refusé.</v-alert
        >
        <v-alert
          v-else-if="pageState === 'error'"
          type="error"
          variant="tonal"
          >{{ error || 'Erreur API.' }}</v-alert
        >
        <v-skeleton-loader
          v-else-if="pageState === 'loading'"
          type="article, article, article"
        />
        <v-alert v-else-if="pageState === 'empty'" type="info" variant="tonal"
          >Aucune offre disponible.</v-alert
        >

        <div v-else class="offers-board-page__grid">
          <div class="offers-board-page__list">
            <OffersOfferListCard
              v-for="offer in mappedOffers"
              :key="offer.id"
              :offer="offer"
              :active="selectedOffer?.id === offer.id"
              :favorited="favorites.includes(offer.id)"
              action-label="Schnell bewerben"
              action-icon="mdi-send-outline"
              @select="selectedId = $event"
              @favorite="toggleFavorite"
              @action="apply"
            />
          </div>

          <OffersOfferDetailsPanel
            v-if="selectedOffer"
            :title="selectedOffer.title"
            :company="selectedOffer.company"
            :location="selectedOffer.location"
            :salary="selectedOffer.salary"
            :highlights="[
              'Konzeption und Umsetzung neuer Features mit Vue/Nuxt',
              'Zusammenarbeit mit Design und Product in kurzen Iterationen',
              'Qualitätssicherung mit Tests und Code Reviews',
            ]"
            :requirements="[
              'Mindestens 3 Jahre Erfahrung in Frontend-Entwicklung',
              'Sicherer Umgang mit TypeScript und REST APIs',
              'Strukturierte und teamorientierte Arbeitsweise',
            ]"
            :perks="[
              'Flexible Arbeitszeiten und Homeoffice Budget',
              'Weiterbildungsbudget und Mentoring',
              '30 Urlaubstage und moderne Hardware',
            ]"
          />
        </div>
      </section>
    </div>

    <v-navigation-drawer
      v-model="mobileFilters"
      temporary
      location="right"
      width="320"
    >
      <div class="pa-4">
        <OffersFiltersSidebar
          v-model="selectedFilters"
          title="Filter"
          :sections="filterSections"
        />
      </div>
    </v-navigation-drawer>

    <v-overlay :model-value="actionLoading" class="align-center justify-center">
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>
  </main>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { Notify } from '~/stores/notification'
import { buildApiPlatformQuery } from '../../../services/admin/_shared'
import { httpGet, HttpRequestError } from '../../../services/http/client'
import {
  jobApplicationsService,
  type JobApplication,
} from '../../../services/admin/job-applications'

definePageMeta({
  icon: 'mdi-account-check-outline',
  title: 'My Applications',
  drawerIndex: 23,
  requiresAuth: true,
  middleware: ['auth'],
})

const rows = ref<JobApplication[]>([])
const loading = ref(false)
const actionLoading = ref(false)
const error = ref<string | null>(null)
const forbidden = ref(false)
const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const location = ref('')
const selectedId = ref('')
const filters = ref({ status: '' })
const selectedFilters = ref<Record<string, string[]>>({})
const mobileFilters = ref(false)

const { smAndDown } = useDisplay()

const filterSections = [
  {
    key: 'status',
    title: 'Status',
    items: [
      { label: 'En attente', value: 'pending', count: 5 },
      { label: 'Acceptée', value: 'accepted', count: 2 },
      { label: 'Rejetée', value: 'rejected', count: 3 },
      { label: 'Retirée', value: 'withdrawn', count: 1 },
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

const mappedOffers = computed(() =>
  rows.value.map((row, index) => ({
    id: String(row.id),
    title: `Candidature #${row.id}`,
    company: String(row.jobOffer),
    matchingScore: 72 + (index % 3) * 8,
    location: location.value || 'Remote',
    salary: row.cvUrl ? 'CV joint' : 'Sans CV',
    tags: [row.status, row.coverLetter ? 'Lettre jointe' : 'Sans lettre'],
    status: statusMeta(row.status).label,
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

function statusMeta(status: string) {
  if (status === 'accepted')
    return { label: 'Acceptée', tone: 'success' as const }
  if (status === 'rejected') return { label: 'Rejetée', tone: 'error' as const }
  if (status === 'withdrawn')
    return { label: 'Retirée', tone: 'neutral' as const }
  return { label: 'En attente', tone: 'warning' as const }
}

function canWithdraw(row: JobApplication) {
  return row.status === 'pending'
}

function toApplicationsArray(payload: unknown): JobApplication[] {
  if (Array.isArray(payload)) return payload as JobApplication[]
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

  return Array.isArray(collection) ? (collection as JobApplication[]) : []
}

async function loadRows() {
  loading.value = true
  error.value = null
  forbidden.value = false

  try {
    const response = await httpGet<unknown>('/api/job-applications', {
      query: {
        ...buildApiPlatformQuery({
          page: page.value,
          pageSize: pageSize.value,
          search: search.value,
          sortBy: 'id',
          sortOrder: 'desc',
          filters: { status: filters.value.status || undefined },
        }),
      },
    })

    rows.value = toApplicationsArray(response)
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

async function withdraw(offerId: string) {
  const item = rows.value.find((row) => String(row.id) === offerId)
  if (!item || !canWithdraw(item)) {
    Notify.error('Seules les candidatures en attente peuvent être retirées.')
    return
  }

  actionLoading.value = true

  try {
    await jobApplicationsService.withdraw(offerId)
    Notify.success('Candidature retirée.')
    await loadRows()
  } catch (errorValue) {
    Notify.error(toErrorMessage(errorValue))
  } finally {
    actionLoading.value = false
  }
}

watch([page, pageSize], loadRows)
watchDebounced(
  [search, location, filters],
  () => {
    page.value = 1
    void loadRows()
  },
  { debounce: 300, maxWait: 1000 },
)

watch(
  selectedFilters,
  (value) => {
    filters.value.status = value.status?.[0] || ''
  },
  { deep: true },
)

onMounted(loadRows)
</script>

<template>
  <main class="offers-board-page">
    <OffersSearchBar
      v-model:query="search"
      v-model:location="location"
      app-bar-teleport
      show-filter-drawer-button
      :filter-drawer-open="mobileFilters"
      @search="loadRows"
      @filter="mobileFilters = !mobileFilters"
    />

    <div class="offers-board-page__layout">
      <section class="offers-board-page__content">

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
          type="article, article"
        />
        <v-alert v-else-if="pageState === 'empty'" type="info" variant="tonal"
          >Aucune candidature.</v-alert
        >

        <div v-else class="offers-board-page__grid">
          <div class="offers-board-page__list">
            <OffersOfferListCard
              v-for="offer in mappedOffers"
              :key="offer.id"
              :offer="offer"
              :active="selectedOffer?.id === offer.id"
              action-label="Retirer"
              action-icon="mdi-undo"
              @select="selectedId = $event"
              @action="withdraw"
            />
          </div>

          <OffersOfferDetailsPanel
            v-if="selectedOffer"
            :title="selectedOffer.title"
            :company="selectedOffer.company"
            :location="selectedOffer.location"
            :salary="selectedOffer.salary"
            :description="'Consultez le statut de votre candidature et les prochaines étapes du process.'"
            :highlights="[
              'Candidature transmise au recruteur',
              'Profil évalué selon les critères du poste',
              'Retour attendu sous 5 jours ouvrés',
            ]"
            :requirements="[
              'CV à jour',
              'Portfolio ou références',
              'Disponibilité communiquée',
            ]"
            :perks="[
              'Notifications en temps réel',
              'Suivi des étapes',
              'Historique centralisé',
            ]"
          />
        </div>
      </section>
    </div>

    <v-navigation-drawer
      v-model="mobileFilters"
      class="offers-filters-drawer"
      :temporary="smAndDown"
      :scrim="smAndDown"
      floating
      location="right"
      width="300"
    >
      <div>
        <OffersFiltersSidebar
          v-model="selectedFilters"
          title="Filtrer"
          :sections="filterSections"
        />
      </div>
    </v-navigation-drawer>

    <v-overlay :model-value="actionLoading" class="align-center justify-center">
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>
  </main>
</template>

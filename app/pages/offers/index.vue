<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { Notify } from '~/stores/notification'
import { buildApiPlatformQuery } from '../../../services/admin/_shared'
import { HttpRequestError } from '../../../services/http/client'
import { jobApplicationsService } from '../../../services/admin/job-applications'
import { jobOffersService, type JobOffer } from '../../../services/admin/job-offers'

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
    key: 'type',
    title: 'Anstellungsart',
    items: [
      { label: 'Vollzeit', value: 'full-time', count: 35 },
      { label: 'Teilzeit', value: 'part-time', count: 12 },
      { label: 'Freelance', value: 'freelance', count: 8 },
    ],
  },
  {
    key: 'mode',
    title: 'Arbeitsmodell',
    items: [
      { label: 'Remote', value: 'remote', count: 25 },
      { label: 'Hybrid', value: 'hybrid', count: 18 },
      { label: 'Vor Ort', value: 'onsite', count: 10 },
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

const mappedOffers = computed(() => rows.value.map((row, index) => ({
  id: String(row.id),
  title: row.title,
  company: String(row.company),
  matchingScore: 76 + (index % 4) * 5,
  matchingLabel: 'Passt hervorragend',
  location: location.value || 'Berlin',
  workMode: 'Hybrid',
  salary: '60.000€ - 85.000€',
  tags: ['TypeScript', 'Vue', 'API'],
  status: row.status === 'open' ? 'Offen' : row.status,
})))

const selectedOffer = computed(() => mappedOffers.value.find(offer => offer.id === selectedId.value) ?? mappedOffers.value[0])

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
    const response = await jobOffersService.list({
      ...buildApiPlatformQuery({
        page: page.value,
        pageSize: pageSize.value,
        search: search.value,
        sortBy: 'title',
        sortOrder: 'asc',
        filters: { status: 'open' },
      }),
    })

    rows.value = response.data
    const firstOffer = response.data.at(0)
    if (!selectedId.value && firstOffer) {
      selectedId.value = String(firstOffer.id)
    }
  } catch (errorValue) {
    if (errorValue instanceof HttpRequestError && errorValue.statusCode === 403) {
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
    ? favorites.value.filter(id => id !== offerId)
    : [...favorites.value, offerId]
}

watch([page, pageSize], loadRows)
watchDebounced([search, location], () => {
  page.value = 1
  void loadRows()
}, { debounce: 300, maxWait: 1000 })

onMounted(loadRows)
</script>

<template>
  <main class="offers-board-page">
    <OffersSearchBar
      v-model:query="search"
      v-model:location="location"
      title="Finde deinen nächsten Job"
      subtitle="Entdecke passende Rollen mit modernem Job-Board Layout."
      @search="loadRows"
    />

    <div class="offers-board-page__layout">
      <OffersFiltersSidebar
        v-if="!mdAndDown"
        v-model="selectedFilters"
        title="Filter"
        :sections="filterSections"
      />

      <section class="offers-board-page__content">
        <div v-if="mdAndDown" class="offers-board-page__mobile-tools">
          <v-btn variant="outlined" prepend-icon="mdi-filter-variant" @click="mobileFilters = true">Filter</v-btn>
        </div>

        <v-alert v-if="pageState === 'forbidden'" type="error" variant="tonal">403 · Accès refusé.</v-alert>
        <v-alert v-else-if="pageState === 'error'" type="error" variant="tonal">{{ error || 'Erreur API.' }}</v-alert>
        <v-skeleton-loader v-else-if="pageState === 'loading'" type="article, article, article" />
        <v-alert v-else-if="pageState === 'empty'" type="info" variant="tonal">Aucune offre disponible.</v-alert>

        <div v-else class="offers-board-page__grid">
          <div class="offers-board-page__list">
            <OfferListCard
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

          <OfferDetailsPanel
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

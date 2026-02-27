<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useJobApplicationStore } from '~/stores/job-application'
import { useJobOfferStore } from '~/stores/job-offer'
import { HttpRequestError } from '../../../services/http/client'

definePageMeta({
  icon: 'mdi-briefcase-search-outline',
  title: 'Offers',
  drawerIndex: 20,
  requiresAuth: true,
  middleware: ['auth'],
})

const offerStore = useJobOfferStore()
const applicationStore = useJobApplicationStore()

const {
  error,
  selectedId,
  selectedFilters,
  search,
  pagination,
  mappedOffers,
  selectedOffer,
  pageState,
} = storeToRefs(offerStore)

const actionLoading = ref(false)
const favorites = ref<string[]>([])
const mobileFilters = ref(false)
const { smAndDown } = useDisplay()

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

function toErrorMessage(errorValue: unknown) {
  if (errorValue instanceof HttpRequestError) return errorValue.message
  if (errorValue instanceof Error) return errorValue.message
  return 'Erreur API.'
}

async function loadRows() {
  await offerStore.fetchWithFilters('all')
}

async function apply(offerId: string) {
  actionLoading.value = true
  try {
    await applicationStore.apply(offerId)
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

watch(
  () => [pagination.value.page, pagination.value.pageSize],
  loadRows,
)

watchDebounced(
  [search, selectedFilters],
  () => {
    pagination.value.page = 1
    void loadRows()
  },
  { debounce: 300, maxWait: 1000 },
)

onMounted(loadRows)
</script>

<template>
  <main
    class="offers-board-page"
    :class="{ 'offers-board-page--filters-open': mobileFilters }"
  >
    <OffersSearchBar
      v-model:query="search"
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
          type="article, article, article"
        />
        <v-alert v-else-if="pageState === 'empty'" type="info" variant="tonal"
          >Aucune offre disponible.</v-alert
        >

        <div v-else class="offers-board-page__grid">
          <div class="offers-board-page__list-card">
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

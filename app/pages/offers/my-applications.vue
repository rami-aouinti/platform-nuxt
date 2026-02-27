<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useJobApplicationStore } from '~/stores/job-application'
import { canWithdrawApplication } from '~/domain/offers/helpers'
import { HttpRequestError } from '../../../services/http/client'

definePageMeta({
  icon: 'mdi-account-check-outline',
  title: 'My Applications',
  drawerIndex: 23,
  requiresAuth: true,
  middleware: ['auth'],
})

const applicationStore = useJobApplicationStore()

const {
  rows,
  error,
  selectedId,
  selectedFilters,
  search,
  pagination,
  mappedOffers,
  selectedOffer,
  pageState,
  statusCounters,
} = storeToRefs(applicationStore)

const actionLoading = ref(false)
const location = ref('')
const mobileFilters = ref(false)

const { smAndDown } = useDisplay()

const filterSections = computed(() => [
  {
    key: 'status',
    title: 'Status',
    items: [
      { label: 'En attente', value: 'pending', count: statusCounters.value.pending },
      { label: 'Acceptée', value: 'accepted', count: statusCounters.value.accepted },
      { label: 'Rejetée', value: 'rejected', count: statusCounters.value.rejected },
      { label: 'Retirée', value: 'withdrawn', count: statusCounters.value.withdrawn },
    ],
  },
])

function toErrorMessage(errorValue: unknown) {
  if (errorValue instanceof HttpRequestError) return errorValue.message
  if (errorValue instanceof Error) return errorValue.message
  return 'Erreur API.'
}

async function loadRows() {
  await applicationStore.fetchWithFilters()
}

async function withdraw(offerId: string) {
  const item = rows.value.find((row) => String(row.id) === offerId)
  if (!item || !canWithdrawApplication(item)) {
    Notify.error('Seules les candidatures en attente peuvent être retirées.')
    return
  }

  actionLoading.value = true

  try {
    await applicationStore.withdraw(offerId)
    Notify.success('Candidature retirée.')
    await loadRows()
  } catch (errorValue) {
    Notify.error(toErrorMessage(errorValue))
  } finally {
    actionLoading.value = false
  }
}

watch(
  () => [pagination.value.page, pagination.value.pageSize],
  loadRows,
)
watchDebounced(
  [search, selectedFilters, location],
  () => {
    pagination.value.page = 1
    selectedFilters.value.location = location.value ? [location.value] : []
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

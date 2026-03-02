<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useJobApplicationStore } from '~/stores/job-application'
import { canWithdrawApplication } from '~/domain/offers/helpers'
import { toUiErrorMessage } from '~/utils/errors/toUiErrorMessage'

definePageMeta({
  icon: 'mdi-account-check-outline',
  title: 'My Applications',
  drawerIndex: 23,
  requiresAuth: true,
  middleware: ['auth'],
})

const applicationStore = useJobApplicationStore()
const { t } = useI18n()

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
    title: t('offers.myApplications.filters.status.title'),
    items: [
      { label: t('offers.shared.status.pending'), value: 'pending', count: statusCounters.value.pending },
      { label: t('offers.shared.status.accepted'), value: 'accepted', count: statusCounters.value.accepted },
      { label: t('offers.shared.status.rejected'), value: 'rejected', count: statusCounters.value.rejected },
      { label: t('offers.shared.status.withdrawn'), value: 'withdrawn', count: statusCounters.value.withdrawn },
    ],
  },
])


async function loadRows() {
  await applicationStore.fetchWithFilters()
}

async function withdraw(offerId: string) {
  const item = rows.value.find((row) => String(row.id) === offerId)
  if (!item || !canWithdrawApplication(item)) {
    Notify.error(String(useNuxtApp().$i18n.t('notifications.ui.onlyPendingWithdraw')))
    return
  }

  actionLoading.value = true

  try {
    await applicationStore.withdraw(offerId)
    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.applicationWithdrawn')))
    await loadRows()
  } catch (errorValue) {
    Notify.error(toUiErrorMessage(errorValue))
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
          >{{ t('offers.shared.forbidden') }}</v-alert
        >
        <v-alert
          v-else-if="pageState === 'error'"
          type="error"
          variant="tonal"
          >{{ error || t('offers.shared.apiError') }}</v-alert
        >
        <v-skeleton-loader
          v-else-if="pageState === 'loading'"
          type="article, article"
        />
        <v-alert v-else-if="pageState === 'empty'" type="info" variant="tonal"
          >{{ t('offers.myApplications.empty') }}</v-alert
        >

        <div v-else class="offers-board-page__grid">
          <div class="offers-board-page__list">
            <OffersOfferListCard
              v-for="offer in mappedOffers"
              :key="offer.id"
              :offer="offer"
              :active="selectedOffer?.id === offer.id"
              :action-label="t('offers.myApplications.actions.withdraw')"
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
            :description="t('offers.myApplications.details.description')"
            :highlights="[
              t('offers.myApplications.details.highlights.sent'),
              t('offers.myApplications.details.highlights.evaluated'),
              t('offers.myApplications.details.highlights.feedback'),
            ]"
            :requirements="[
              t('offers.myApplications.details.requirements.cv'),
              t('offers.myApplications.details.requirements.portfolio'),
              t('offers.myApplications.details.requirements.availability'),
            ]"
            :perks="[
              t('offers.myApplications.details.perks.realtime'),
              t('offers.myApplications.details.perks.tracking'),
              t('offers.myApplications.details.perks.history'),
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
          :title="t('offers.myApplications.filters.sidebarTitle')"
          :sections="filterSections"
        />
      </div>
    </v-navigation-drawer>

    <v-overlay :model-value="actionLoading" class="align-center justify-center">
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>
  </main>
</template>

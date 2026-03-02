<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useJobApplicationStore } from '~/stores/job-application'
import { useJobOfferStore } from '~/stores/job-offer'
import { applicationStatusMeta } from '~/domain/offers/helpers'
import type { JobOffer } from '../../../services/admin/job-offers/index/index'
import { toUiErrorMessage } from '~/utils/errors/toUiErrorMessage'

definePageMeta({
  icon: 'mdi-briefcase-edit-outline',
  title: 'My Offers',
  drawerIndex: 21,
  requiresAuth: true,
  middleware: ['auth'],
})

type OfferForm = {
  id?: string
  title: string
  slug: string
  description: string
  company: string
  status: JobOffer['status']
}

const offerStore = useJobOfferStore()
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
} = storeToRefs(offerStore)

const actionLoading = ref(false)
const editDialog = ref(false)
const location = ref('')
const dialogDelete = useTemplateRef('dialogDelete')
const { smAndDown } = useDisplay()

const editing = ref<OfferForm>({
  title: '',
  slug: '',
  description: '',
  company: '',
  status: 'draft',
})

const filterSections = computed(() => [
  {
    key: 'status',
    title: t('offers.myOffers.filters.status.title'),
    items: [
      { label: t('offers.myOffers.filters.status.draft'), value: 'draft' },
      { label: t('offers.myOffers.filters.status.open'), value: 'open' },
      { label: t('offers.myOffers.filters.status.closed'), value: 'closed' },
    ],
  },
])
const mobileFilters = ref(false)

const selectedRow = computed(() =>
  rows.value.find((item) => String(item.id) === selectedOffer.value?.id),
)


function applicationCandidateName(
  application: NonNullable<JobOffer['jobApplications']>[number],
) {
  const candidate = application.candidate
  if (!candidate || typeof candidate === 'string') return t('offers.shared.notProvided')
  return candidate.firstName || candidate.username || candidate.email || t('offers.shared.notProvided')
}

function openEdit(offerId: string) {
  const row = rows.value.find((item) => String(item.id) === offerId)
  if (!row) return

  editing.value = {
    id: String(row.id),
    title: row.title,
    slug: row.slug,
    description: row.description,
    company: String(
      typeof row.company === 'string' ? row.company : row.company?.id || '',
    ),
    status: row.status,
  }
  editDialog.value = true
}

async function loadRows() {
  await offerStore.fetchWithFilters('mine')
}

async function saveOffer() {
  if (!editing.value.id) {
    Notify.error(String(useNuxtApp().$i18n.t('notifications.ui.invalidOffer')))
    return
  }

  actionLoading.value = true
  try {
    await offerStore.update(editing.value.id, {
      title: editing.value.title,
      slug: editing.value.slug,
      description: editing.value.description,
      company: editing.value.company,
      status: editing.value.status,
    })
    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.offerUpdated')))
    editDialog.value = false
    await loadRows()
  } catch (errorValue) {
    Notify.error(toUiErrorMessage(errorValue))
  } finally {
    actionLoading.value = false
  }
}

async function deleteOffer(offerId: string) {
  const row = rows.value.find((item) => String(item.id) === offerId)
  if (!row) return

  const identifier = String(row.title || row.id)
  const confirmed = await dialogDelete.value?.open(
    t('offers.myOffers.delete.confirm', { identifier }),
    {
      confirmationLabel: t('offers.myOffers.delete.confirmLabel', { identifier }),
      expectedConfirmationText: identifier,
    },
  )

  if (!confirmed) return

  actionLoading.value = true

  try {
    await offerStore.remove(offerId)
    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.offerDeleted')))
    await loadRows()
  } catch (errorValue) {
    Notify.error(toUiErrorMessage(errorValue))
  } finally {
    actionLoading.value = false
  }
}

async function decideApplication(
  id: string,
  action: 'accept' | 'reject' | 'withdraw',
  successMessage: string,
) {
  actionLoading.value = true

  try {
    const result = await applicationStore.transition(id, action)
    if (!result) {
      Notify.error(String(useNuxtApp().$i18n.t('notifications.ui.statusTransitionForbidden')))
      return
    }

    Notify.success(successMessage)
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
          >{{ t('offers.myOffers.empty') }}</v-alert
        >

        <div v-else class="offers-board-page__grid">
          <div class="offers-board-page__list">
            <OffersOfferListCard
              v-for="offer in mappedOffers"
              :key="offer.id"
              :offer="offer"
              :active="selectedOffer?.id === offer.id"
              :action-label="t('offers.myOffers.actions.edit')"
              action-icon="mdi-pencil-outline"
              @select="selectedId = $event"
              @action="openEdit"
            />
            <v-btn
              v-if="selectedOffer"
              variant="text"
              color="error"
              prepend-icon="mdi-delete-outline"
              @click="deleteOffer(selectedOffer.id)"
            >
              {{ t('offers.myOffers.actions.deleteSelected') }}
            </v-btn>
          </div>

          <div v-if="selectedOffer" class="d-flex flex-column ga-4">
            <OffersOfferDetailsPanel
              :title="selectedOffer.title"
              :company="selectedOffer.company"
              :location="selectedOffer.location"
              :salary="selectedOffer.salary"
              :description="
                selectedRow?.description ||
                t('offers.myOffers.details.descriptionFallback')
              "
              :highlights="[
                t('offers.myOffers.details.highlights.adjustMission'),
                t('offers.myOffers.details.highlights.verifyStack'),
                t('offers.myOffers.details.highlights.updateCompensation'),
              ]"
              :requirements="[
                t('offers.myOffers.details.requirements.experience'),
                t('offers.myOffers.details.requirements.communication'),
                t('offers.myOffers.details.requirements.autonomy'),
              ]"
              :perks="[
                t('offers.myOffers.details.perks.remote'),
                t('offers.myOffers.details.perks.bonus'),
                t('offers.myOffers.details.perks.healthcare'),
              ]"
            />

            <v-card variant="flat" rounded="lg" border>
              <v-card-title class="text-subtitle-1">{{ t('offers.myOffers.applications.title') }}</v-card-title>
              <v-divider />
              <v-list lines="two" density="comfortable">
                <template
                  v-for="application in selectedRow?.jobApplications || []"
                  :key="application.id"
                >
                  <v-list-item>
                    <template #title>
                      <div class="d-flex align-center ga-2">
                        <span>{{ applicationCandidateName(application) }}</span>
                        <v-chip
                          size="small"
                          :color="applicationStatusMeta(application.status).tone"
                          variant="tonal"
                          >{{ applicationStatusMeta(application.status).label }}</v-chip
                        >
                      </div>
                    </template>
                    <template #subtitle>
                      <span>{{ t('offers.myOffers.applications.applicationId', { id: application.id }) }}</span>
                    </template>
                    <template #append>
                      <div class="d-flex ga-1">
                        <v-btn
                          v-if="application.status === 'pending'"
                          size="small"
                          color="success"
                          variant="text"
                          icon="mdi-check"
                          :loading="actionLoading"
                          @click="decideApplication(String(application.id), 'accept', t('offers.myOffers.applications.accepted'))"
                        />
                        <v-btn
                          v-if="application.status === 'pending'"
                          size="small"
                          color="error"
                          variant="text"
                          icon="mdi-close"
                          :loading="actionLoading"
                          @click="decideApplication(String(application.id), 'reject', t('offers.myOffers.applications.rejected'))"
                        />
                        <v-btn
                          size="small"
                          color="default"
                          variant="text"
                          icon="mdi-undo-variant"
                          :loading="actionLoading"
                          @click="decideApplication(String(application.id), 'withdraw', t('offers.myOffers.applications.withdrawn'))"
                        />
                      </div>
                    </template>
                  </v-list-item>
                  <v-divider />
                </template>

                <v-list-item
                  v-if="!(selectedRow?.jobApplications || []).length"
                  :title="t('offers.myOffers.applications.emptyTitle')"
                  :subtitle="t('offers.myOffers.applications.emptySubtitle')"
                />
              </v-list>
            </v-card>
          </div>
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
          :title="t('offers.myOffers.filters.sidebarTitle')"
          :sections="filterSections"
        />
      </div>
    </v-navigation-drawer>

    <DialogConfirm ref="dialogDelete" />

    <v-dialog v-model="editDialog" max-width="760">
      <v-card>
        <v-card-title>{{ t('offers.myOffers.editDialog.title') }}</v-card-title>
        <v-card-text class="pt-4">
          <v-text-field v-model="editing.title" :label="t('offers.myOffers.editDialog.fields.title')" class="mb-2" />
          <v-text-field v-model="editing.slug" :label="t('offers.myOffers.editDialog.fields.slug')" class="mb-2" />
          <v-text-field
            v-model="editing.company"
            :label="t('offers.myOffers.editDialog.fields.companyId')"
            class="mb-2"
          />
          <v-select
            v-model="editing.status"
            :items="[
              { title: t('offers.myOffers.filters.status.draft'), value: 'draft' },
              { title: t('offers.myOffers.filters.status.open'), value: 'open' },
              { title: t('offers.myOffers.filters.status.closed'), value: 'closed' },
            ]"
            :label="t('offers.myOffers.filters.status.title')"
            class="mb-2"
          />
          <v-textarea
            v-model="editing.description"
            :label="t('offers.myOffers.editDialog.fields.description')"
            rows="4"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="primary" :loading="actionLoading" @click="saveOffer"
            >{{ t('offers.myOffers.editDialog.save') }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </main>
</template>

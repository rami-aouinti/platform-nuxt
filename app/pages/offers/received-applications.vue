<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { Notify } from '~/stores/notification'
import AdminBadge from '~/components/admin/ui/AdminBadge.vue'
import AdminCard from '~/components/admin/ui/AdminCard.vue'
import AdminToolbar from '~/components/admin/ui/AdminToolbar.vue'
import AdminErrorState from '~/components/admin/ui/AdminErrorState.vue'
import AdminEmptyState from '~/components/admin/ui/AdminEmptyState.vue'
import { buildApiPlatformQuery } from '../../../services/admin/shared/index'
import { HttpRequestError } from '../../../services/http/client'
import { jobApplicationsService, type JobApplication } from '../../../services/admin/job-applications/index'
import { toUiErrorMessage } from '~/utils/errors/toUiErrorMessage'
const { t } = useI18n()

definePageMeta({
  icon: 'mdi-inbox-arrow-down-outline',
  title: 'Received Applications',
  drawerIndex: 22,
  requiresAuth: true,
  middleware: ['auth'],
})

const rows = ref<JobApplication[]>([])
const loading = ref(false)
const actionLoading = ref(false)
const error = ref<string | null>(null)
const forbidden = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const filters = ref({ status: 'pending' })

const columns: DataTableHeader[] = [
  { title: t('offers.receivedApplications.columns.id'), key: 'id' },
  { title: t('offers.receivedApplications.columns.offer'), key: 'jobOffer' },
  { title: t('offers.receivedApplications.columns.candidate'), key: 'candidate' },
  { title: t('offers.receivedApplications.columns.letter'), key: 'coverLetter' },
  { title: t('offers.receivedApplications.columns.cv'), key: 'cvUrl' },
  { title: t('offers.receivedApplications.columns.status'), key: 'status' },
]

const pageState = computed(() => {
  if (forbidden.value) return 'forbidden'
  if (error.value) return 'error'
  if (loading.value) return 'loading'
  if (!rows.value.length) return 'empty'
  return 'ready'
})


function statusMeta(status: string) {
  if (status === 'accepted') return { label: t('offers.shared.status.accepted'), tone: 'success' as const }
  if (status === 'rejected') return { label: t('offers.shared.status.rejected'), tone: 'error' as const }
  if (status === 'withdrawn') return { label: t('offers.shared.status.withdrawn'), tone: 'neutral' as const }
  return { label: t('offers.shared.status.pending'), tone: 'warning' as const }
}

function canReview(row: Record<string, unknown>) {
  return String(row.status ?? '') === 'pending'
}

async function loadRows() {
  loading.value = true
  error.value = null
  forbidden.value = false

  try {
    const response = await jobApplicationsService.list({
      ...buildApiPlatformQuery({
        page: page.value,
        pageSize: pageSize.value,
        search: search.value,
        sortBy: 'id',
        sortOrder: 'desc',
        filters: { status: filters.value.status || undefined },
      }),
    })

    rows.value = response.data
    total.value = response.meta?.totalItems ?? response.data.length
  } catch (errorValue) {
    if (errorValue instanceof HttpRequestError && errorValue.statusCode === 403) {
      forbidden.value = true
      return
    }

    error.value = toUiErrorMessage(errorValue)
  } finally {
    loading.value = false
  }
}

async function runAction(label: string, action: () => Promise<unknown>) {
  actionLoading.value = true

  try {
    await action()
    Notify.success(label)
    await loadRows()
  } catch (errorValue) {
    Notify.error(toUiErrorMessage(errorValue))
  } finally {
    actionLoading.value = false
  }
}

watch([page, pageSize], loadRows)
watchDebounced([search, filters], () => {
  page.value = 1
  void loadRows()
}, { debounce: 300, maxWait: 1000 })

onMounted(loadRows)
</script>

<template>
  <AdminCard>
    <AdminToolbar :title="t('offers.receivedApplications.title')" :description="t('offers.receivedApplications.description')">
      <template #actions>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" @click="loadRows">{{ t('common.reload') }}</v-btn>
      </template>
    </AdminToolbar>

    <template v-if="pageState === 'forbidden'">
      <v-sheet class="pa-6 text-center" rounded="lg" border>
        <div class="text-h6 mb-2">{{ t('offers.shared.forbidden') }}</div>
        <p class="text-medium-emphasis mb-4">{{ t('offers.receivedApplications.forbiddenDescription') }}</p>
      </v-sheet>
    </template>

    <AdminErrorState v-else-if="pageState === 'error'" :message="error || t('offers.shared.apiError')" :can-retry="true" @retry="loadRows" />

    <template v-else>
      <v-row dense class="mb-2">
        <v-col cols="12" md="5">
          <v-text-field v-model="search" :label="t('offers.receivedApplications.searchLabel')" prepend-inner-icon="mdi-magnify" hide-details clearable />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="filters.status"
            :items="[
              { title: t('offers.receivedApplications.filters.all'), value: '' },
              { title: t('offers.shared.status.pending'), value: 'pending' },
              { title: t('offers.shared.status.accepted'), value: 'accepted' },
              { title: t('offers.shared.status.rejected'), value: 'rejected' },
              { title: t('offers.shared.status.withdrawn'), value: 'withdrawn' },
            ]"
            :label="t('offers.receivedApplications.filters.status')"
            hide-details
          />
        </v-col>
      </v-row>

      <AdminEmptyState
        v-if="pageState === 'empty'"
        :title="t('offers.receivedApplications.emptyTitle')"
        :message="t('offers.receivedApplications.emptyMessage')"
      />

      <AdminTable
        v-else
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :total="total"
        :page="page"
        :page-size="pageSize"
        @update:page="page = $event"
        @update:page-size="pageSize = $event"
      >
        <template #cell:coverLetter="{ value }">
          <span class="text-body-2">{{ String(value || '-').slice(0, 80) }}</span>
        </template>

        <template #cell:cvUrl="{ value }">
          <span class="text-body-2">{{ value ? t('offers.receivedApplications.cvProvided') : t('offers.shared.notProvided') }}</span>
        </template>

        <template #cell:status="{ value }">
          <AdminBadge :status="statusMeta(String(value)).tone" :label="statusMeta(String(value)).label" />
        </template>

        <template #row-actions="{ item }">
          <v-btn
            v-if="canReview(item)"
            size="small"
            variant="text"
            color="success"
            icon="mdi-check"
            :loading="actionLoading"
            @click.stop="runAction(t('offers.receivedApplications.actions.accepted'), () => jobApplicationsService.accept(String(item.id)))"
          />
          <v-btn
            v-if="canReview(item)"
            size="small"
            variant="text"
            color="error"
            icon="mdi-close"
            :loading="actionLoading"
            @click.stop="runAction(t('offers.receivedApplications.actions.rejected'), () => jobApplicationsService.reject(String(item.id)))"
          />
        </template>
      </AdminTable>
    </template>
  </AdminCard>
</template>

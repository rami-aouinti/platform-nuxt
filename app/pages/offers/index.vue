<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { Notify } from '~/stores/notification'
import AdminBadge from '~/components/admin/ui/AdminBadge.vue'
import AdminCard from '~/components/admin/ui/AdminCard.vue'
import AdminToolbar from '~/components/admin/ui/AdminToolbar.vue'
import AdminErrorState from '~/components/admin/ui/AdminErrorState.vue'
import AdminEmptyState from '~/components/admin/ui/AdminEmptyState.vue'
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
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const search = ref('')

const columns: DataTableHeader[] = [
  { title: 'ID', key: 'id' },
  { title: 'Titre', key: 'title' },
  { title: 'Entreprise', key: 'company' },
  { title: 'Statut', key: 'status' },
  { title: 'Description', key: 'description' },
]

const pageState = computed(() => {
  if (forbidden.value) return 'forbidden'
  if (error.value) return 'error'
  if (loading.value) return 'loading'
  if (!rows.value.length) return 'empty'
  return 'ready'
})

function toErrorMessage(errorValue: unknown) {
  if (errorValue instanceof HttpRequestError) return errorValue.message
  if (errorValue instanceof Error) return errorValue.message
  return 'Erreur API.'
}

function statusMeta(status: string) {
  if (status === 'open') return { label: 'Ouverte', tone: 'success' as const }
  if (status === 'closed') return { label: 'Fermée', tone: 'error' as const }
  return { label: 'Brouillon', tone: 'warning' as const }
}

function canApply(row: Record<string, unknown>) {
  return String(row.status ?? '') === 'open'
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
    total.value = response.meta?.totalItems ?? response.data.length
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

async function apply(row: Record<string, unknown>) {
  if (!canApply(row)) {
    Notify.error('Seules les offres ouvertes sont disponibles pour candidater.')
    return
  }

  actionLoading.value = true

  try {
    await jobApplicationsService.apply(String(row.id))
    Notify.success('Candidature envoyée.')
  } catch (errorValue) {
    Notify.error(toErrorMessage(errorValue))
  } finally {
    actionLoading.value = false
  }
}

watch([page, pageSize], loadRows)
watchDebounced(search, () => {
  page.value = 1
  void loadRows()
}, { debounce: 300, maxWait: 1000 })

onMounted(loadRows)
</script>

<template>
  <AdminCard>
    <AdminToolbar title="Offres disponibles" description="Consulter les offres ouvertes et postuler en un clic.">
      <template #actions>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" @click="loadRows">Recharger</v-btn>
      </template>
    </AdminToolbar>

    <template v-if="pageState === 'forbidden'">
      <v-sheet class="pa-6 text-center" rounded="lg" border>
        <div class="text-h6 mb-2">403 · Accès refusé</div>
        <p class="text-medium-emphasis mb-4">Vous n'êtes pas autorisé à consulter les offres.</p>
      </v-sheet>
    </template>

    <AdminErrorState v-else-if="pageState === 'error'" :message="error || 'Erreur API.'" :can-retry="true" @retry="loadRows" />

    <template v-else>
      <v-row dense class="mb-2">
        <v-col cols="12" md="5">
          <v-text-field v-model="search" label="Recherche" prepend-inner-icon="mdi-magnify" hide-details clearable />
        </v-col>
      </v-row>

      <AdminEmptyState
        v-if="pageState === 'empty'"
        title="Aucune offre disponible"
        message="Aucune offre ouverte ne correspond à la recherche courante."
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
        <template #cell:status="{ value }">
          <AdminBadge :status="statusMeta(String(value)).tone" :label="statusMeta(String(value)).label" />
        </template>

        <template #cell:description="{ value }">
          <span class="text-body-2">{{ String(value || '-').slice(0, 120) }}</span>
        </template>

        <template #row-actions="{ item }">
          <v-btn
            size="small"
            variant="text"
            color="primary"
            prepend-icon="mdi-send-outline"
            :disabled="!canApply(item)"
            :loading="actionLoading"
            @click.stop="apply(item)"
          >
            Postuler
          </v-btn>
        </template>
      </AdminTable>
    </template>
  </AdminCard>
</template>

<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { isAdmin } from '~/utils/permissions/admin'
import AdminBadge from '~/components/admin/ui/AdminBadge.vue'
import AdminCard from '~/components/admin/ui/AdminCard.vue'
import AdminToolbar from '~/components/admin/ui/AdminToolbar.vue'
import AdminErrorState from '~/components/admin/ui/AdminErrorState.vue'
import AdminEmptyState from '~/components/admin/ui/AdminEmptyState.vue'
import { HttpRequestError } from '../../../../services/http/client'
import { jobApplicationsService, type JobApplication } from '../../../../services/admin/job-applications'

definePageMeta({
  icon: 'mdi-file-document-check-outline',
  title: 'Job applications',
  drawerIndex: 77,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
})

const authStore = useAuthStore()
const { roles } = storeToRefs(authStore)

const rows = ref<JobApplication[]>([])
const loading = ref(false)
const actionLoading = ref(false)
const error = ref<string | null>(null)
const forbidden = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const filters = ref({ status: '' })

const applyDialog = ref(false)
const applyOfferId = ref('')
const applyCoverLetter = ref('')

const columns: DataTableHeader[] = [
  { title: 'ID', key: 'id' },
  { title: 'Offer', key: 'offerId' },
  { title: 'Candidate', key: 'candidateId' },
  { title: 'Status', key: 'status' },
]

const pageState = computed(() => {
  if (forbidden.value) return 'forbidden'
  if (error.value) return 'error'
  if (loading.value) return 'loading'
  if (!rows.value.length) return 'empty'
  return 'ready'
})

const canModerate = computed(() => isAdmin(roles.value))
const canApply = computed(() => !canModerate.value)

function toErrorMessage(errorValue: unknown) {
  if (errorValue instanceof HttpRequestError) return errorValue.message
  if (errorValue instanceof Error) return errorValue.message
  return 'Erreur API.'
}

function statusMeta(status: string) {
  if (status === 'accepted') return { label: 'Acceptée', tone: 'success' as const }
  if (status === 'rejected') return { label: 'Rejetée', tone: 'error' as const }
  if (status === 'withdrawn') return { label: 'Retirée', tone: 'neutral' as const }
  return { label: 'En attente', tone: 'warning' as const }
}

function canAccept(row: Record<string, unknown>) {
  return canModerate.value && String(row.status ?? '') === 'pending'
}

function canReject(row: Record<string, unknown>) {
  return canModerate.value && String(row.status ?? '') === 'pending'
}

function canWithdraw(row: Record<string, unknown>) {
  return canApply.value && String(row.status ?? '') === 'pending'
}

async function loadRows() {
  loading.value = true
  error.value = null
  forbidden.value = false

  try {
    const response = await jobApplicationsService.list({
      page: page.value,
      pageSize: pageSize.value,
      search: search.value || undefined,
      filters: { status: filters.value.status || undefined },
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

async function applyToOffer() {
  if (!canApply.value) {
    Notify.error('Action réservée aux candidats.')
    return
  }

  if (!applyOfferId.value.trim()) {
    Notify.error('ID offre obligatoire.')
    return
  }

  actionLoading.value = true

  try {
    await jobApplicationsService.apply(applyOfferId.value.trim())
    Notify.success('Candidature envoyée.')
    applyDialog.value = false
    applyOfferId.value = ''
    applyCoverLetter.value = ''
    await loadRows()
  } catch (errorValue) {
    Notify.error(toErrorMessage(errorValue))
  } finally {
    actionLoading.value = false
  }
}

async function runAction(label: string, action: () => Promise<unknown>) {
  actionLoading.value = true

  try {
    await action()
    Notify.success(label)
    await loadRows()
  } catch (errorValue) {
    Notify.error(toErrorMessage(errorValue))
  } finally {
    actionLoading.value = false
  }
}

watch([page, pageSize], loadRows)
watchDebounced([search, filters], () => {
  page.value = 1
  void loadRows()
}, { debounce: 300, maxWait: 1000 })

onMounted(async () => {
  await authStore.ensureRolesLoaded()
  await loadRows()
})
</script>

<template>
  <AdminCard>
    <AdminToolbar title="Job applications" description="Suivre les candidatures et appliquer les transitions métier.">
      <template #actions>
        <v-btn v-if="canApply" color="primary" prepend-icon="mdi-send-outline" @click="applyDialog = true">Postuler</v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" @click="loadRows">Recharger</v-btn>
      </template>
    </AdminToolbar>

    <template v-if="pageState === 'forbidden'">
      <v-sheet class="pa-6 text-center" rounded="lg" border>
        <div class="text-h6 mb-2">403 · Accès refusé</div>
        <p class="text-medium-emphasis mb-4">Vous n'êtes pas autorisé à consulter les candidatures.</p>
        <v-btn to="/administration" prepend-icon="mdi-arrow-left">Retour à l'administration</v-btn>
      </v-sheet>
    </template>

    <AdminErrorState v-else-if="pageState === 'error'" :message="error || 'Erreur API.'" :can-retry="true" @retry="loadRows" />

    <template v-else>
      <v-row dense class="mb-2">
        <v-col cols="12" md="5">
          <v-text-field v-model="search" label="Recherche" prepend-inner-icon="mdi-magnify" hide-details clearable />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="filters.status"
            :items="[
              { title: 'Tous', value: '' },
              { title: 'En attente', value: 'pending' },
              { title: 'Acceptée', value: 'accepted' },
              { title: 'Rejetée', value: 'rejected' },
              { title: 'Retirée', value: 'withdrawn' },
            ]"
            label="Statut"
            hide-details
          />
        </v-col>
      </v-row>

      <AdminEmptyState
        v-if="pageState === 'empty'"
        title="Aucune candidature"
        message="Aucune candidature ne correspond aux filtres courants."
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

        <template #row-actions="{ item }">
          <v-btn
            v-if="canAccept(item)"
            size="small"
            variant="text"
            color="success"
            icon="mdi-check"
            :loading="actionLoading"
            @click.stop="runAction('Candidature acceptée.', () => jobApplicationsService.accept(String(item.id)))"
          />
          <v-btn
            v-if="canReject(item)"
            size="small"
            variant="text"
            color="error"
            icon="mdi-close"
            :loading="actionLoading"
            @click.stop="runAction('Candidature rejetée.', () => jobApplicationsService.reject(String(item.id)))"
          />
          <v-btn
            v-if="canWithdraw(item)"
            size="small"
            variant="text"
            color="warning"
            icon="mdi-undo"
            :loading="actionLoading"
            @click.stop="runAction('Candidature retirée.', () => jobApplicationsService.withdraw(String(item.id)))"
          />
        </template>
      </AdminTable>
    </template>

    <v-dialog v-model="applyDialog" max-width="560">
      <v-card>
        <v-card-title>Postuler à une offre</v-card-title>
        <v-card-text class="admin-form pt-4">
          <v-text-field v-model="applyOfferId" label="ID offre" class="mb-2" />
          <v-textarea v-model="applyCoverLetter" label="Lettre de motivation (optionnel)" rows="4" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="applyDialog = false">Annuler</v-btn>
          <v-btn color="primary" :loading="actionLoading" @click="applyToOffer">Postuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AdminCard>
</template>

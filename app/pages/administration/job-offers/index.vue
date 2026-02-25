<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { Notify } from '~/stores/notification'
import AdminBadge from '~/components/admin/ui/AdminBadge.vue'
import AdminCard from '~/components/admin/ui/AdminCard.vue'
import AdminToolbar from '~/components/admin/ui/AdminToolbar.vue'
import AdminErrorState from '~/components/admin/ui/AdminErrorState.vue'
import AdminEmptyState from '~/components/admin/ui/AdminEmptyState.vue'
import { HttpRequestError } from '../../../../services/http/client'
import { jobOffersService, type JobOffer } from '../../../../services/admin/job-offers'

definePageMeta({
  icon: 'mdi-briefcase-search-outline',
  title: 'Job offers',
  drawerIndex: 76,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
})

type OfferForm = {
  id?: string
  title: string
  slug: string
  description: string
  companyId: string
  status: JobOffer['status']
}

const rows = ref<JobOffer[]>([])
const loading = ref(false)
const actionLoading = ref(false)
const error = ref<string | null>(null)
const forbidden = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const filters = ref({ status: '' })

const dialogDelete = useTemplateRef('dialogDelete')
const editDialog = ref(false)
const editing = ref<OfferForm>({ title: '', slug: '', description: '', companyId: '', status: 'draft' })

const columns: DataTableHeader[] = [
  { title: 'ID', key: 'id' },
  { title: 'Titre', key: 'title' },
  { title: 'Entreprise', key: 'companyId' },
  { title: 'Statut', key: 'status' },
  { title: 'Slug', key: 'slug' },
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
  if (status === 'published') return { label: 'Publiée', tone: 'success' as const }
  if (status === 'closed') return { label: 'Fermée', tone: 'error' as const }
  return { label: 'Brouillon', tone: 'warning' as const }
}

function openCreate() {
  editing.value = { title: '', slug: '', description: '', companyId: '', status: 'draft' }
  editDialog.value = true
}

function openEdit(row: Record<string, unknown>) {
  editing.value = {
    id: String(row.id ?? ''),
    title: String(row.title ?? ''),
    slug: String(row.slug ?? ''),
    description: String(row.description ?? ''),
    companyId: String(row.companyId ?? ''),
    status: String(row.status ?? 'draft') as JobOffer['status'],
  }
  editDialog.value = true
}

async function loadRows() {
  loading.value = true
  error.value = null
  forbidden.value = false

  try {
    const response = await jobOffersService.list({
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

async function saveOffer() {
  if (!editing.value.title || !editing.value.slug || !editing.value.companyId) {
    Notify.error('Titre, slug et entreprise sont obligatoires.')
    return
  }

  actionLoading.value = true

  try {
    if (editing.value.id) {
      await jobOffersService.update(editing.value.id, {
        title: editing.value.title,
        slug: editing.value.slug,
        description: editing.value.description,
        companyId: editing.value.companyId,
        status: editing.value.status,
      })
      Notify.success('Offre mise à jour.')
    } else {
      await jobOffersService.create({
        title: editing.value.title,
        slug: editing.value.slug,
        description: editing.value.description,
        companyId: editing.value.companyId,
        status: editing.value.status,
      })
      Notify.success('Offre créée.')
    }

    editDialog.value = false
    await loadRows()
  } catch (errorValue) {
    Notify.error(toErrorMessage(errorValue))
  } finally {
    actionLoading.value = false
  }
}

async function deleteOffer(row: Record<string, unknown>) {
  const identifier = String(row.title || row.id)
  const confirmed = await dialogDelete.value?.open(`Supprimer l'offre ${identifier} ?`, {
    confirmationLabel: `Saisissez ${identifier} pour confirmer`,
    expectedConfirmationText: identifier,
  })

  if (!confirmed) return

  actionLoading.value = true

  try {
    await jobOffersService.remove(String(row.id))
    Notify.success('Offre supprimée.')
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

onMounted(loadRows)
</script>

<template>
  <AdminCard>
    <AdminToolbar title="Job offers" description="Lister, filtrer et gérer les offres d'emploi.">
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Créer une offre</v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" @click="loadRows">Recharger</v-btn>
      </template>
    </AdminToolbar>

    <template v-if="pageState === 'forbidden'">
      <v-sheet class="pa-6 text-center" rounded="lg" border>
        <div class="text-h6 mb-2">403 · Accès refusé</div>
        <p class="text-medium-emphasis mb-4">Vous n'êtes pas autorisé à consulter les offres d'administration.</p>
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
              { title: 'Brouillon', value: 'draft' },
              { title: 'Publiée', value: 'published' },
              { title: 'Fermée', value: 'closed' },
            ]"
            label="Statut"
            hide-details
          />
        </v-col>
      </v-row>

      <AdminEmptyState
        v-if="pageState === 'empty'"
        title="Aucune offre"
        message="Aucune offre ne correspond aux filtres. Créez une nouvelle offre pour démarrer."
      >
        <template #actions>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Créer une offre</v-btn>
        </template>
      </AdminEmptyState>

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
          <v-btn size="small" icon="mdi-pencil-outline" variant="text" color="warning" :loading="actionLoading" @click.stop="openEdit(item)" />
          <v-btn size="small" icon="mdi-delete-outline" variant="text" color="error" :loading="actionLoading" @click.stop="deleteOffer(item)" />
        </template>
      </AdminTable>
    </template>

    <DialogConfirm ref="dialogDelete" />

    <v-dialog v-model="editDialog" max-width="760">
      <v-card>
        <v-card-title>{{ editing.id ? 'Modifier l\'offre' : 'Créer une offre' }}</v-card-title>
        <v-card-text class="admin-form pt-4">
          <v-text-field v-model="editing.title" label="Titre" class="mb-2" />
          <v-text-field v-model="editing.slug" label="Slug" class="mb-2" />
          <v-text-field v-model="editing.companyId" label="ID entreprise" class="mb-2" />
          <v-select
            v-model="editing.status"
            :items="[
              { title: 'Brouillon', value: 'draft' },
              { title: 'Publiée', value: 'published' },
              { title: 'Fermée', value: 'closed' },
            ]"
            label="Statut"
            class="mb-2"
          />
          <v-textarea v-model="editing.description" label="Description" rows="4" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">Annuler</v-btn>
          <v-btn color="primary" :loading="actionLoading" @click="saveOffer">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AdminCard>
</template>

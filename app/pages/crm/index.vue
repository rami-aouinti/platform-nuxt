<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { useCrmApi } from '~/composables/api/useCrmApi'
import type { CrmCompany } from '~/composables/api/useCrmApi'

const crmApi = useCrmApi()
const router = useRouter()

definePageMeta({
  icon: 'mdi-account-group-outline',
  title: 'CRM · Companies',
  drawerIndex: 7,
  requiresAuth: true,
  middleware: ['auth'],
})

const loading = ref(false)
const createLoading = ref(false)
const errorMessage = ref('')
const companies = ref<CrmCompany[]>([])
const createDialog = ref(false)

const companyForm = reactive({
  name: '',
  description: '',
})

function normalizeItems<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (
    value &&
    typeof value === 'object' &&
    'items' in value &&
    Array.isArray((value as { items?: unknown }).items)
  ) {
    return (value as { items: T[] }).items
  }
  if (
    value &&
    typeof value === 'object' &&
    'data' in value &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: T[] }).data
  }
  return []
}

const hasCompanies = computed(() => companies.value.length > 0)

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  return fallback
}

function getRoleLabel(company: CrmCompany) {
  if (company.role === 'owner') return 'Owner'
  if (company.role === 'member') return 'Member'
  if (company.role) return String(company.role)
  return 'Member'
}

function getProjectsCount(company: CrmCompany) {
  if (typeof company.projectsCount === 'number') return company.projectsCount
  if (company.stats && typeof company.stats.projectsCount === 'number')
    return company.stats.projectsCount
  if (Array.isArray(company.projects)) return company.projects.length
  if (typeof company.projects === 'number') return company.projects
  return null
}

async function loadCompanies() {
  loading.value = true
  errorMessage.value = ''
  try {
    const companiesResult = await crmApi.listCompanies()
    companies.value = normalizeItems<CrmCompany>(companiesResult)
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Erreur de chargement des companies.',
    )
  } finally {
    loading.value = false
  }
}

async function createCompany() {
  if (!companyForm.name.trim()) {
    Notify.error('Le nom de la company est requis.')
    return
  }

  createLoading.value = true
  try {
    await crmApi.createCompany({
      name: companyForm.name.trim(),
      description: companyForm.description.trim() || undefined,
    })

    companyForm.name = ''
    companyForm.description = ''
    createDialog.value = false
    Notify.success('Company créée.')
    await loadCompanies()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur création company.'))
  } finally {
    createLoading.value = false
  }
}

function openCompany(companyId: string) {
  router.push(`/crm/companies/${companyId}`)
}

onMounted(loadCompanies)
</script>

<template>
  <v-container fluid>
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
      <h1 class="text-h5">CRM · Companies</h1>
      <div class="d-flex ga-2">
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadCompanies"
        >
          Recharger
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="createDialog = true"
        >
          Ajouter une company
        </v-btn>
      </div>
    </div>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      class="mb-4"
      :text="errorMessage"
    >
      <template #append>
        <v-btn
          size="small"
          variant="text"
          prepend-icon="mdi-refresh"
          @click="loadCompanies"
          >Réessayer</v-btn
        >
      </template>
    </v-alert>

    <v-row v-if="loading">
      <v-col v-for="index in 6" :key="index" cols="12" md="6" lg="4">
        <v-skeleton-loader type="article" />
      </v-col>
    </v-row>

    <v-alert
      v-else-if="!hasCompanies"
      type="info"
      variant="tonal"
      class="mb-4"
      text="Aucune company visible pour le moment."
    />

    <v-row v-else>
      <v-col
        v-for="company in companies"
        :key="company.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="h-100" hover @click="openCompany(company.id)">
          <v-card-title class="d-flex align-center justify-space-between ga-2">
            <span class="text-truncate">{{ company.name }}</span>
            <v-chip size="small" color="primary" variant="tonal">{{
              getRoleLabel(company)
            }}</v-chip>
          </v-card-title>
          <v-card-text>
            <p class="text-body-2 text-medium-emphasis mb-3">
              {{ company.description || 'Aucune description.' }}
            </p>
            <v-chip
              v-if="getProjectsCount(company) !== null"
              size="small"
              prepend-icon="mdi-briefcase-outline"
              variant="outlined"
            >
              {{ getProjectsCount(company) }} projet<span
                v-if="getProjectsCount(company) !== 1"
                >s</span
              >
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="createDialog" max-width="560">
      <v-card>
        <v-card-title>Ajouter une company</v-card-title>
        <v-card-text>
          <v-text-field v-model="companyForm.name" label="Nom" autofocus />
          <v-textarea
            v-model="companyForm.description"
            label="Description"
            rows="3"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            :disabled="createLoading"
            @click="createDialog = false"
            >Annuler</v-btn
          >
          <v-btn color="primary" :loading="createLoading" @click="createCompany"
            >Créer</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

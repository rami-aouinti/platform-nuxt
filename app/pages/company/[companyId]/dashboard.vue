<script setup lang="ts">
import { useCompanyWorkspaceApi, type CompanyDetail } from '~/composables/useCompanyWorkspaceApi'

definePageMeta({ middleware: ['auth'], requiresAuth: true })

const route = useRoute()
const workspaceApi = useCompanyWorkspaceApi()

const company = ref<CompanyDetail | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const companyId = computed(() => {
  const param = route.params.companyId
  return Array.isArray(param) ? (param[0] ?? '') : (param ?? '')
})

const ownerName = computed(() => {
  const owner = company.value?.owner
  if (!owner) return '-'
  return [owner.firstName, owner.lastName].filter(Boolean).join(' ').trim() || owner.username || owner.email || '-'
})

const companyRows = computed(() => {
  if (!company.value) return []

  return [
    { label: 'ID', value: String(company.value.id) },
    { label: 'Nom légal', value: company.value.legalName || company.value.name || '-' },
    { label: 'Statut', value: company.value.status || '-' },
    { label: 'Owner', value: ownerName.value },
  ]
})

async function loadCompany() {
  if (!companyId.value) {
    error.value = 'Identifiant de company invalide.'
    company.value = null
    return
  }

  loading.value = true
  error.value = null

  try {
    company.value = await workspaceApi.getCompany(companyId.value)
  } catch (errorValue) {
    company.value = null
    error.value = errorValue instanceof Error ? errorValue.message : 'Impossible de charger la company.'
  } finally {
    loading.value = false
  }
}

watch(companyId, loadCompany, { immediate: true })
</script>

<template>
  <CompanyWorkspaceLayout active-page="dashboard">
    <h1 class="text-h4 mb-4">Company dashboard</h1>

    <div v-if="loading" class="d-flex align-center ga-3">
      <v-progress-circular indeterminate color="primary" />
      <span>Chargement de la company...</span>
    </div>

    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      density="comfortable"
      rounded="lg"
      class="mb-4"
    >
      {{ error }}
    </v-alert>

    <v-alert
      v-else-if="!company"
      type="info"
      variant="tonal"
      density="comfortable"
      rounded="lg"
      class="mb-4"
    >
      Aucune company trouvée.
    </v-alert>

    <v-card v-else variant="tonal" rounded="lg">
      <v-card-text>
        <div class="d-flex align-center ga-3 mb-4">
          <v-avatar size="56">
            <v-img :src="company.photoUrl || undefined" :alt="company.legalName || 'company avatar'" />
          </v-avatar>
          <div>
            <p class="text-h6 mb-1">{{ company.legalName || company.name || 'Company sans nom' }}</p>
            <p class="text-body-2 text-medium-emphasis mb-0">Statut : {{ company.status || '-' }}</p>
          </div>
        </div>

        <v-row>
          <v-col
            v-for="row in companyRows"
            :key="row.label"
            cols="12"
            md="6"
          >
            <p class="text-caption text-medium-emphasis mb-1">{{ row.label }}</p>
            <p class="text-body-1 mb-0">{{ row.value }}</p>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </CompanyWorkspaceLayout>
</template>

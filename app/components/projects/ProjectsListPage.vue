<script setup lang="ts">
import { useCrmApi, type CrmProject } from '~/composables/api/useCrmApi'

type ProjectsViewState = 'loading' | 'empty' | 'error' | 'success'

interface ProjectRow {
  id: string
  name: string
  image?: string
  owner: string
  ownerId: string | null
  managerIds: string[]
  status: 'Actif' | 'En pause' | 'Terminé'
}

type CrmProjectExtended = CrmProject & {
  owner?: { id?: string; name?: string } | string | null
  ownerId?: string | null
  managers?: Array<{ id?: string } | string> | null
}

const { t } = useI18n()
const crmApi = useCrmApi()
const rows = ref<ProjectRow[]>([])
const state = ref<ProjectsViewState>('loading')

const headers = [
  { title: 'Projet', key: 'name' },
  { title: 'Responsable', key: 'owner' },
  { title: 'Statut', key: 'status' },
  { title: 'Action', key: 'actions', sortable: false },
]

function normalizeItems<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object' && 'items' in value && Array.isArray((value as { items?: unknown }).items)) {
    return (value as { items: T[] }).items
  }
  if (value && typeof value === 'object' && 'data' in value && Array.isArray((value as { data?: unknown }).data)) {
    return (value as { data: T[] }).data
  }
  return []
}

function mapStatus(status: string): ProjectRow['status'] {
  if (status === 'active') return 'Actif'
  if (status === 'archived') return 'Terminé'
  return 'En pause'
}

function mapOwner(project: CrmProjectExtended) {
  if (project.owner && typeof project.owner === 'object') {
    return {
      name: project.owner.name || project.owner.id || 'Non assigné',
      id: project.owner.id || null,
    }
  }

  if (typeof project.owner === 'string') {
    return { name: project.owner, id: project.owner }
  }

  if (typeof project.ownerId === 'string') {
    return { name: project.ownerId, id: project.ownerId }
  }

  return { name: 'Non assigné', id: null }
}

function mapManagers(project: CrmProjectExtended) {
  if (!Array.isArray(project.managers)) return []

  return project.managers
    .map((entry) => (typeof entry === 'string' ? entry : entry.id || ''))
    .filter(Boolean)
}

function mapProjectToRow(project: CrmProjectExtended): ProjectRow {
  const owner = mapOwner(project)
  return {
    id: project.id,
    name: project.name,
    image: project.image || project.photo || project.photoUrl || undefined,
    owner: owner.name,
    ownerId: owner.id,
    managerIds: mapManagers(project),
    status: mapStatus(project.status),
  }
}

async function load() {
  state.value = 'loading'

  try {
    const result = await crmApi.listProjects()
    rows.value = normalizeItems<CrmProjectExtended>(result).map(mapProjectToRow)
    state.value = rows.value.length ? 'success' : 'empty'
  } catch {
    rows.value = []
    state.value = 'error'
  }
}

onMounted(load)
</script>

<template>
  <v-container class="py-6">
    <div class="d-flex align-center justify-space-between mb-4 ga-2 flex-wrap">
      <h1 class="text-h5">{{ t('projects.title') }}</h1>
      <div class="d-flex ga-2 flex-wrap">
        <v-btn variant="text" prepend-icon="mdi-sync" @click="load">{{ t('common.reload') }}</v-btn>
      </div>
    </div>

    <div v-if="state === 'loading'" class="d-flex flex-column ga-3">
      <v-skeleton-loader type="table-heading, list-item-three-line, list-item-three-line" />
      <v-progress-circular indeterminate color="primary" size="24" class="mx-auto" />
    </div>

    <v-alert v-else-if="state === 'empty'" type="info" variant="tonal" border="start" icon="mdi-folder-open-outline">
      Aucun projet disponible pour le moment.
    </v-alert>

    <v-alert v-else-if="state === 'error'" type="error" variant="tonal" border="start" class="d-flex align-center">
      Impossible de charger les projets.
      <template #append>
        <v-btn size="small" color="error" variant="outlined" @click="load">Réessayer</v-btn>
      </template>
    </v-alert>

    <v-data-table v-else :headers="headers" :items="rows" item-value="id" class="elevation-1" hover>
      <template #item.name="{ item }">
        <div class="d-flex align-center ga-2">
          <v-avatar size="28">
            <v-img v-if="item.image" :src="item.image" :alt="item.name" />
            <span v-else>{{ item.name.slice(0, 1).toUpperCase() }}</span>
          </v-avatar>
          <NuxtLink :to="`/projects/${item.id}`" class="text-decoration-none">{{ item.name }}</NuxtLink>
        </div>
      </template>
      <template #item.actions="{ item }">
        <v-btn size="small" color="primary" variant="text" :to="`/projects/${item.id}`">Voir</v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup lang="ts">
import { Notify } from '~/stores/notification'
import type { useCrmApi } from '~/composables/api/useCrmApi'

const crmApi = useCrmApi()

definePageMeta({
  icon: 'mdi-view-kanban-outline',
  title: 'CRM Kanban',
  drawerIndex: 8,
  requiresAuth: true,
  middleware: ['auth'],
})

const loading = ref(false)
const selectedProjectId = ref<string>('')
const projects = ref<{ id: string; name: string }[]>([])
const tasks = ref<CrmTask[]>([])

const columns = [
  { key: 'todo', label: 'Todo' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'done', label: 'Done' },
  { key: 'archived', label: 'Archived' },
] as const

function normalizeItems<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object' && 'items' in value && Array.isArray((value as { items?: unknown }).items)) {
    return ((value as { items: unknown[] }).items as T[])
  }
  if (value && typeof value === 'object' && 'data' in value && Array.isArray((value as { data?: unknown }).data)) {
    return ((value as { data: unknown[] }).data as T[])
  }
  return []
}

function taskProjectId(task: CrmTask) {
  if (!task.project || Array.isArray(task.project)) return ''
  return String(task.project.id ?? '')
}

const filteredTasks = computed(() =>
  selectedProjectId.value
    ? tasks.value.filter((task) => taskProjectId(task) === selectedProjectId.value)
    : tasks.value,
)

async function loadData() {
  loading.value = true
  try {
    const [projectsResult, tasksResult] = await Promise.all([
      crmApi.listProjects(),
      crmApi.listTasks(),
    ])
    projects.value = normalizeItems<{ id: string; name: string }>(projectsResult)
    tasks.value = normalizeItems<CrmTask>(tasksResult)
  } catch (error) {
    Notify.error(error instanceof Error ? error.message : 'Erreur chargement kanban CRM.')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <v-container fluid>
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
      <h1 class="text-h5">CRM Kanban</h1>
      <div class="d-flex ga-2">
        <v-btn variant="tonal" to="/crm" prepend-icon="mdi-arrow-left">Retour CRM</v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadData">Recharger</v-btn>
      </div>
    </div>

    <v-select
      v-model="selectedProjectId"
      :items="projects"
      item-title="name"
      item-value="id"
      label="Filtrer par project"
      clearable
      class="mb-4"
    />

    <v-row>
      <v-col v-for="column in columns" :key="column.key" cols="12" md="3">
        <v-card>
          <v-card-title>{{ column.label }}</v-card-title>
          <v-divider />
          <v-list density="compact">
            <v-list-item
              v-for="task in filteredTasks.filter((entry) => entry.status === column.key)"
              :key="task.id"
              :title="task.title"
              :subtitle="task.priority"
            />
            <v-list-item
              v-if="!filteredTasks.some((entry) => entry.status === column.key)"
              title="Aucune task"
            />
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

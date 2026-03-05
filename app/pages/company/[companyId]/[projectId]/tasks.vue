<script setup lang="ts">
import { apiRequest, type Id } from '~/composables/api/httpUiErrors'
import { apiEndpoints } from '~/services/api/endpoints'
import { Notify } from '~/stores/notification'

definePageMeta({ middleware: ['auth'], requiresAuth: true })

type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
type TaskStatus = 'todo' | 'in_progress' | 'done' | 'archived'

type ProjectTask = {
  id: string
  title: string
  description?: string | null
  priority?: TaskPriority | null
  status?: TaskStatus | null
  dueDate?: string | null
  completedAt?: string | null
}

type ProjectTasksResponse = {
  tasks?: ProjectTask[]
}

const route = useRoute()
const projectId = computed(() => {
  const raw = route.params.projectId
  return Array.isArray(raw) ? String(raw[0] || '') : String(raw || '')
})

const tasks = ref<ProjectTask[]>([])
const loading = ref(false)
const submitting = ref(false)
const saveMode = ref<'create' | 'edit'>('create')
const currentTaskId = ref<string | null>(null)
const dialogOpen = ref(false)

const form = reactive({
  title: '',
  description: '',
  priority: 'medium' as TaskPriority,
  status: 'todo' as TaskStatus,
  dueDate: '',
})

const priorityItems = [
  { title: 'Low', value: 'low' },
  { title: 'Medium', value: 'medium' },
  { title: 'High', value: 'high' },
  { title: 'Urgent', value: 'urgent' },
]

const statusItems = [
  { title: 'Todo', value: 'todo' },
  { title: 'In progress', value: 'in_progress' },
  { title: 'Done', value: 'done' },
  { title: 'Archived', value: 'archived' },
]

function resetForm() {
  form.title = ''
  form.description = ''
  form.priority = 'medium'
  form.status = 'todo'
  form.dueDate = ''
}

function openCreateDialog() {
  saveMode.value = 'create'
  currentTaskId.value = null
  resetForm()
  dialogOpen.value = true
}

function openEditDialog(task: ProjectTask) {
  saveMode.value = 'edit'
  currentTaskId.value = task.id
  form.title = task.title
  form.description = task.description || ''
  form.priority = (task.priority || 'medium') as TaskPriority
  form.status = (task.status || 'todo') as TaskStatus
  form.dueDate = task.dueDate ? task.dueDate.slice(0, 10) : ''
  dialogOpen.value = true
}

function tasksEndpoint(project: Id) {
  return apiEndpoints.frontend.projects.tasks(project)
}

function taskByIdEndpoint(project: Id, taskId: Id) {
  return apiEndpoints.frontend.projects.taskById(project, taskId)
}

async function loadTasks() {
  if (!projectId.value) {
    tasks.value = []
    return
  }

  loading.value = true
  try {
    const response = await apiRequest<ProjectTasksResponse>('GET', tasksEndpoint(projectId.value))
    tasks.value = Array.isArray(response.tasks) ? response.tasks : []
  } catch {
    tasks.value = []
    Notify.error('Impossible de charger les tasks du projet.')
  } finally {
    loading.value = false
  }
}

async function saveTask() {
  if (!projectId.value || !form.title.trim()) return

  submitting.value = true
  const payload = {
    title: form.title.trim(),
    description: form.description.trim() || null,
    priority: form.priority,
    status: form.status,
    dueDate: form.dueDate ? `${form.dueDate}T00:00:00+00:00` : null,
    completedAt: null,
  }

  try {
    if (saveMode.value === 'create') {
      await apiRequest('POST', tasksEndpoint(projectId.value), { body: payload })
      Notify.success('Task ajoutée avec succès.')
    } else if (currentTaskId.value) {
      await apiRequest('PATCH', taskByIdEndpoint(projectId.value, currentTaskId.value), { body: payload })
      Notify.success('Task modifiée avec succès.')
    }

    dialogOpen.value = false
    await loadTasks()
  } catch {
    Notify.error(saveMode.value === 'create' ? 'Échec de création de la task.' : 'Échec de modification de la task.')
  } finally {
    submitting.value = false
  }
}

async function deleteTask(task: ProjectTask) {
  if (!projectId.value) return

  try {
    await apiRequest('DELETE', taskByIdEndpoint(projectId.value, task.id))
    Notify.success('Task supprimée avec succès.')
    await loadTasks()
  } catch {
    Notify.error('Échec de suppression de la task.')
  }
}

watch(projectId, loadTasks, { immediate: true })
</script>

<template>
  <CompanyProjectWorkspaceLayout active-page="tasks">
    <div class="d-flex align-center justify-space-between mb-4 ga-2 flex-wrap">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Tasks du projet</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-0">Project #{{ projectId }}</p>
      </div>
      <div class="d-flex ga-2">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">Ajouter une task</v-btn>
        <v-btn variant="text" prepend-icon="mdi-refresh" :loading="loading" @click="loadTasks">Rafraîchir</v-btn>
      </div>
    </div>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-alert v-if="!loading && !tasks.length" type="info" variant="tonal" density="comfortable" rounded="lg">
      Aucune task liée à ce projet.
    </v-alert>

    <v-card v-else variant="outlined">
      <v-table>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Due date</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in tasks" :key="task.id">
            <td>{{ task.title }}</td>
            <td>{{ task.priority || '-' }}</td>
            <td>{{ task.status || '-' }}</td>
            <td>{{ task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-' }}</td>
            <td class="text-right">
              <div class="d-flex justify-end ga-2">
                <v-btn size="small" variant="outlined" @click="openEditDialog(task)">Edit</v-btn>
                <v-btn size="small" variant="outlined" color="error" @click="deleteTask(task)">Delete</v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="dialogOpen" max-width="640">
      <v-card>
        <v-card-title>{{ saveMode === 'create' ? 'Ajouter une task' : 'Modifier la task' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="form.title" label="Title" required />
          <v-textarea v-model="form.description" label="Description" rows="3" />
          <div class="d-flex ga-4 flex-wrap">
            <v-select v-model="form.priority" :items="priorityItems" label="Priority" class="flex-1-1" />
            <v-select v-model="form.status" :items="statusItems" label="Status" class="flex-1-1" />
          </div>
          <v-text-field v-model="form.dueDate" label="Due date" type="date" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogOpen = false">Cancel</v-btn>
          <v-btn color="primary" :loading="submitting" :disabled="!form.title.trim()" @click="saveTask">
            {{ saveMode === 'create' ? 'Create' : 'Save' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </CompanyProjectWorkspaceLayout>
</template>

<script setup lang="ts">
import { Notify } from '~/stores/notification'
import {useCrmApi} from "~/composables/api/useCrmApi";

const crmApi = useCrmApi()

definePageMeta({
  icon: 'mdi-account-group-outline',
  title: 'CRM',
  drawerIndex: 7,
  requiresAuth: true,
  middleware: ['auth'],
})

const creating = ref(false)

const companyForm = reactive({ name: '', description: '' })
const projectForm = reactive({ name: '', description: '', status: 'active' as 'active' | 'archived' })
const taskForm = reactive({
  title: '',
  description: '',
  priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  status: 'todo' as 'todo' | 'in_progress' | 'done' | 'archived',
  project: '',
  dueDate: '',
})
const requestForm = reactive({
  task: '',
  type: 'status_change' as const,
  requestedStatus: 'done' as 'todo' | 'in_progress' | 'done' | 'archived',
  note: '',
})

const projects = ref<{ id: string; name: string }[]>([])
const tasks = ref<{ id: string; title: string }[]>([])

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

async function loadReferences() {
  try {
    const [projectResult, taskResult] = await Promise.all([
      crmApi.listProjects(),
      crmApi.listTasks(),
    ])

    projects.value = normalizeItems<{ id: string; name: string }>(projectResult)
    tasks.value = normalizeItems<{ id: string; title: string }>(taskResult)
  } catch {
    Notify.warning('Impossible de charger les références CRM (projects/tasks).')
  }
}

async function createCompany() {
  if (!companyForm.name.trim()) return Notify.error('Company name requis.')
  creating.value = true
  try {
    await crmApi.createCompany({ name: companyForm.name, description: companyForm.description || undefined })
    companyForm.name = ''
    companyForm.description = ''
    Notify.success('Company créée.')
  } catch (error) {
    Notify.error(error instanceof Error ? error.message : 'Erreur création company.')
  } finally {
    creating.value = false
  }
}

async function createProject() {
  if (!projectForm.name.trim()) return Notify.error('Project name requis.')
  creating.value = true
  try {
    await crmApi.createProject({
      name: projectForm.name,
      description: projectForm.description || undefined,
      status: projectForm.status,
    })
    projectForm.name = ''
    projectForm.description = ''
    projectForm.status = 'active'
    Notify.success('Project créé.')
    await loadReferences()
  } catch (error) {
    Notify.error(error instanceof Error ? error.message : 'Erreur création project.')
  } finally {
    creating.value = false
  }
}

async function createTask() {
  if (!taskForm.title.trim()) return Notify.error('Task title requis.')
  creating.value = true
  try {
    await crmApi.createTask({
      title: taskForm.title,
      description: taskForm.description || undefined,
      priority: taskForm.priority,
      status: taskForm.status,
      project: taskForm.project || undefined,
      dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined,
    })
    taskForm.title = ''
    taskForm.description = ''
    taskForm.priority = 'medium'
    taskForm.status = 'todo'
    taskForm.project = ''
    taskForm.dueDate = ''
    Notify.success('Task créée.')
    await loadReferences()
  } catch (error) {
    Notify.error(error instanceof Error ? error.message : 'Erreur création task.')
  } finally {
    creating.value = false
  }
}

async function createRequest() {
  if (!requestForm.task) return Notify.error('Sélectionnez une task.')
  creating.value = true
  try {
    await crmApi.createTaskRequest({
      task: requestForm.task,
      type: requestForm.type,
      requestedStatus: requestForm.requestedStatus,
      note: requestForm.note || undefined,
    })
    requestForm.task = ''
    requestForm.requestedStatus = 'done'
    requestForm.note = ''
    Notify.success('Task request créée.')
  } catch (error) {
    Notify.error(error instanceof Error ? error.message : 'Erreur création request.')
  } finally {
    creating.value = false
  }
}

onMounted(loadReferences)
</script>

<template>
  <v-container fluid>
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
      <h1 class="text-h5">CRM</h1>
      <v-btn color="primary" variant="tonal" to="/crm/kanban" prepend-icon="mdi-view-kanban">
        Aller au Kanban
      </v-btn>
    </div>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Create company</v-card-title>
          <v-card-text>
            <v-text-field v-model="companyForm.name" label="Name" />
            <v-textarea v-model="companyForm.description" label="Description" rows="2" />
            <v-btn color="primary" :loading="creating" @click="createCompany">Créer company</v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Create project</v-card-title>
          <v-card-text>
            <v-text-field v-model="projectForm.name" label="Name" />
            <v-textarea v-model="projectForm.description" label="Description" rows="2" />
            <v-select v-model="projectForm.status" :items="['active', 'archived']" label="Status" />
            <v-btn color="primary" :loading="creating" @click="createProject">Créer project</v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Create task</v-card-title>
          <v-card-text>
            <v-text-field v-model="taskForm.title" label="Title" />
            <v-textarea v-model="taskForm.description" label="Description" rows="2" />
            <v-select v-model="taskForm.priority" :items="['low', 'medium', 'high', 'critical']" label="Priority" />
            <v-select v-model="taskForm.status" :items="['todo', 'in_progress', 'done', 'archived']" label="Status" />
            <v-select
              v-model="taskForm.project"
              :items="projects"
              item-title="name"
              item-value="id"
              label="Project"
              clearable
            />
            <v-text-field v-model="taskForm.dueDate" label="Due date" type="date" />
            <v-btn color="primary" :loading="creating" @click="createTask">Créer task</v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Create task request</v-card-title>
          <v-card-text>
            <v-select
              v-model="requestForm.task"
              :items="tasks"
              item-title="title"
              item-value="id"
              label="Task"
            />
            <v-select v-model="requestForm.requestedStatus" :items="['todo', 'in_progress', 'done', 'archived']" label="Requested status" />
            <v-textarea v-model="requestForm.note" label="Note" rows="2" />
            <v-btn color="primary" :loading="creating" @click="createRequest">Créer request</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

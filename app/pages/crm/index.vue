<script setup lang="ts">
import { Notify } from '~/stores/notification'
import type {
  CrmProject,
  CrmTask,
  CrmTaskRequest,
  CrmTaskStatus,
  CrmTaskRequestStatus,
} from '~/composables/api/useCrmApi'

import {useCrmApi} from "~/composables/api/useCrmApi";

const crmApi = useCrmApi()

definePageMeta({
  icon: 'mdi-account-group-outline',
  title: 'CRM',
  drawerIndex: 7,
  requiresAuth: true,
  middleware: ['auth'],
})

const loading = ref(false)
const projects = ref<CrmProject[]>([])
const tasks = ref<CrmTask[]>([])
const taskRequests = ref<CrmTaskRequest[]>([])

const companyForm = reactive({ name: '', description: '' })
const projectForm = reactive({ name: '', description: '', status: 'active' as 'active' | 'archived' })
const taskForm = reactive({
  title: '',
  description: '',
  priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  status: 'todo' as CrmTaskStatus,
  project: '',
  dueDate: '',
})
const requestForm = reactive({
  task: '',
  type: 'status_change' as const,
  requestedStatus: 'done' as CrmTaskStatus,
  status: 'pending' as CrmTaskRequestStatus,
  note: '',
})

const selectedProjectId = ref('')
const selectedTaskId = ref('')
const selectedTaskRequestId = ref('')

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

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  return fallback
}

function applySelectionFallbacks() {
  if (!selectedProjectId.value && projects.value.length) selectedProjectId.value = String(projects.value[0].id)
  if (!selectedTaskId.value && tasks.value.length) selectedTaskId.value = String(tasks.value[0].id)
  if (!selectedTaskRequestId.value && taskRequests.value.length) selectedTaskRequestId.value = String(taskRequests.value[0].id)
}

async function reloadAll() {
  loading.value = true
  try {
    const [projectResult, taskResult, taskRequestResult] = await Promise.all([
      crmApi.listProjects(),
      crmApi.listTasks(),
      crmApi.listTaskRequests(),
    ])

    projects.value = normalizeItems<CrmProject>(projectResult)
    tasks.value = normalizeItems<CrmTask>(taskResult)
    taskRequests.value = normalizeItems<CrmTaskRequest>(taskRequestResult)
    applySelectionFallbacks()
    Notify.success('Listes CRM rechargées.')
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur de chargement CRM.'))
  } finally {
    loading.value = false
  }
}

async function createCompany() {
  if (!companyForm.name.trim()) return Notify.error('Company name requis.')
  loading.value = true
  try {
    await crmApi.createCompany({ name: companyForm.name, description: companyForm.description || undefined })
    companyForm.name = ''
    companyForm.description = ''
    Notify.success('Company créée.')
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur création company.'))
  } finally {
    loading.value = false
  }
}

async function createProject() {
  if (!projectForm.name.trim()) return Notify.error('Project name requis.')
  loading.value = true
  try {
    await crmApi.createProject({ ...projectForm })
    Notify.success('Project créé (POST /projects).')
    projectForm.name = ''
    projectForm.description = ''
    projectForm.status = 'active'
    await reloadAll()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur création project.'))
  } finally {
    loading.value = false
  }
}

async function getProject() {
  if (!selectedProjectId.value) return Notify.warning('Sélectionnez un project.')
  try {
    const item = await crmApi.getProject(selectedProjectId.value)
    projectForm.name = item.name
    projectForm.description = item.description ?? ''
    projectForm.status = item.status
    Notify.success('Project récupéré (GET /projects/{id}).')
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur récupération project.'))
  }
}

async function putProject() {
  if (!selectedProjectId.value) return Notify.warning('Sélectionnez un project.')
  try {
    await crmApi.updateProject(selectedProjectId.value, {
      name: projectForm.name || 'Updated project',
      description: projectForm.description || undefined,
      status: projectForm.status,
    })
    Notify.success('Project mis à jour (PUT /projects/{id}).')
    await reloadAll()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur update project.'))
  }
}

async function patchProject() {
  if (!selectedProjectId.value) return Notify.warning('Sélectionnez un project.')
  try {
    await crmApi.patchProject(selectedProjectId.value, { description: projectForm.description || 'Patched from CRM page' })
    Notify.success('Project patché (PATCH /projects/{id}).')
    await reloadAll()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur patch project.'))
  }
}

async function deleteProject() {
  if (!selectedProjectId.value) return Notify.warning('Sélectionnez un project.')
  try {
    await crmApi.deleteProject(selectedProjectId.value)
    selectedProjectId.value = ''
    Notify.success('Project supprimé (DELETE /projects/{id}).')
    await reloadAll()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur suppression project.'))
  }
}

async function createTask() {
  if (!taskForm.title.trim()) return Notify.error('Task title requis.')
  try {
    await crmApi.createTask({
      title: taskForm.title,
      description: taskForm.description || undefined,
      priority: taskForm.priority,
      status: taskForm.status,
      project: taskForm.project || undefined,
      dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined,
    })
    Notify.success('Task créée (POST /tasks).')
    taskForm.title = ''
    taskForm.description = ''
    taskForm.status = 'todo'
    taskForm.priority = 'medium'
    taskForm.project = ''
    taskForm.dueDate = ''
    await reloadAll()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur création task.'))
  }
}

async function getTask() {
  if (!selectedTaskId.value) return Notify.warning('Sélectionnez une task.')
  try {
    const item = await crmApi.getTask(selectedTaskId.value)
    taskForm.title = item.title
    taskForm.description = item.description ?? ''
    taskForm.priority = item.priority
    taskForm.status = item.status
    taskForm.project = !item.project || Array.isArray(item.project) ? '' : String(item.project.id ?? '')
    taskForm.dueDate = item.dueDate ? item.dueDate.slice(0, 10) : ''
    Notify.success('Task récupérée (GET /tasks/{id}).')
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur récupération task.'))
  }
}

async function putTask() {
  if (!selectedTaskId.value) return Notify.warning('Sélectionnez une task.')
  try {
    await crmApi.updateTask(selectedTaskId.value, {
      title: taskForm.title || 'Updated task',
      description: taskForm.description || undefined,
      priority: taskForm.priority,
      status: taskForm.status,
      project: taskForm.project || undefined,
      dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined,
    })
    Notify.success('Task mise à jour (PUT /tasks/{id}).')
    await reloadAll()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur update task.'))
  }
}

async function patchTask() {
  if (!selectedTaskId.value) return Notify.warning('Sélectionnez une task.')
  try {
    await crmApi.patchTask(selectedTaskId.value, { description: taskForm.description || 'Patched from CRM page' })
    Notify.success('Task patchée (PATCH /tasks/{id}).')
    await reloadAll()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur patch task.'))
  }
}

async function deleteTask() {
  if (!selectedTaskId.value) return Notify.warning('Sélectionnez une task.')
  try {
    await crmApi.deleteTask(selectedTaskId.value)
    selectedTaskId.value = ''
    Notify.success('Task supprimée (DELETE /tasks/{id}).')
    await reloadAll()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur suppression task.'))
  }
}

async function runTaskWorkflow(action: 'startTask' | 'completeTask' | 'archiveTask' | 'reopenTask', label: string) {
  if (!selectedTaskId.value) return Notify.warning('Sélectionnez une task.')
  try {
    await crmApi[action](selectedTaskId.value)
    Notify.success(`${label} exécuté.`)
    await reloadAll()
  } catch (error) {
    Notify.error(getErrorMessage(error, `Erreur ${label}.`))
  }
}

async function createTaskRequest() {
  if (!requestForm.task) return Notify.error('Sélectionnez une task.')
  try {
    await crmApi.createTaskRequest({
      task: requestForm.task,
      type: requestForm.type,
      requestedStatus: requestForm.requestedStatus,
      note: requestForm.note || undefined,
    })
    Notify.success('Task request créée (POST /task-requests).')
    requestForm.note = ''
    await reloadAll()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur création task request.'))
  }
}

async function getTaskRequest() {
  if (!selectedTaskRequestId.value) return Notify.warning('Sélectionnez une task request.')
  try {
    const item = await crmApi.getTaskRequest(selectedTaskRequestId.value)
    requestForm.task = typeof item.task === 'string' ? item.task : String(item.task?.id ?? '')
    requestForm.requestedStatus = item.requestedStatus ?? 'done'
    requestForm.status = item.status
    requestForm.note = item.note ?? ''
    Notify.success('Task request récupérée (GET /task-requests/{id}).')
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur récupération task request.'))
  }
}

async function putTaskRequest() {
  if (!selectedTaskRequestId.value) return Notify.warning('Sélectionnez une task request.')
  if (!requestForm.task) return Notify.warning('Task requise pour PUT.')
  try {
    await crmApi.updateTaskRequest(selectedTaskRequestId.value, {
      task: requestForm.task,
      type: requestForm.type,
      requestedStatus: requestForm.requestedStatus,
      note: requestForm.note || undefined,
      status: requestForm.status,
    })
    Notify.success('Task request mise à jour (PUT /task-requests/{id}).')
    await reloadAll()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur update task request.'))
  }
}

async function patchTaskRequest() {
  if (!selectedTaskRequestId.value) return Notify.warning('Sélectionnez une task request.')
  try {
    await crmApi.patchTaskRequest(selectedTaskRequestId.value, { note: requestForm.note || 'Patched from CRM page' })
    Notify.success('Task request patchée (PATCH /task-requests/{id}).')
    await reloadAll()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur patch task request.'))
  }
}

async function deleteTaskRequest() {
  if (!selectedTaskRequestId.value) return Notify.warning('Sélectionnez une task request.')
  try {
    await crmApi.deleteTaskRequest(selectedTaskRequestId.value)
    selectedTaskRequestId.value = ''
    Notify.success('Task request supprimée (DELETE /task-requests/{id}).')
    await reloadAll()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur suppression task request.'))
  }
}

async function runTaskRequestWorkflow(action: 'approveTaskRequest' | 'rejectTaskRequest' | 'cancelTaskRequest', label: string) {
  if (!selectedTaskRequestId.value) return Notify.warning('Sélectionnez une task request.')
  try {
    await crmApi[action](selectedTaskRequestId.value)
    Notify.success(`${label} exécuté.`)
    await reloadAll()
  } catch (error) {
    Notify.error(getErrorMessage(error, `Erreur ${label}.`))
  }
}

onMounted(reloadAll)
</script>

<template>
  <v-container fluid>
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
      <h1 class="text-h5">CRM</h1>
      <div class="d-flex ga-2">
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="reloadAll">Recharger tout</v-btn>
        <v-btn color="primary" variant="outlined" to="/crm/kanban" prepend-icon="mdi-view-kanban">Aller au Kanban</v-btn>
      </div>
    </div>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Company</v-card-title>
          <v-card-text>
            <v-text-field v-model="companyForm.name" label="Name" />
            <v-textarea v-model="companyForm.description" label="Description" rows="2" />
            <v-btn color="primary" :loading="loading" @click="createCompany">POST /companies</v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Projects (all endpoints)</v-card-title>
          <v-card-text>
            <v-select v-model="selectedProjectId" :items="projects" item-title="name" item-value="id" label="Project cible" clearable />
            <v-text-field v-model="projectForm.name" label="Name" />
            <v-textarea v-model="projectForm.description" label="Description" rows="2" />
            <v-select v-model="projectForm.status" :items="['active', 'archived']" label="Status" />
            <div class="d-flex flex-wrap ga-2">
              <v-btn :loading="loading" @click="reloadAll">GET /projects</v-btn>
              <v-btn color="primary" :loading="loading" @click="createProject">POST /projects</v-btn>
              <v-btn :loading="loading" @click="getProject">GET /projects/{id}</v-btn>
              <v-btn :loading="loading" @click="putProject">PUT /projects/{id}</v-btn>
              <v-btn :loading="loading" @click="patchProject">PATCH /projects/{id}</v-btn>
              <v-btn color="error" :loading="loading" @click="deleteProject">DELETE /projects/{id}</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Tasks (all endpoints)</v-card-title>
          <v-card-text>
            <v-select v-model="selectedTaskId" :items="tasks" item-title="title" item-value="id" label="Task cible" clearable />
            <v-text-field v-model="taskForm.title" label="Title" />
            <v-textarea v-model="taskForm.description" label="Description" rows="2" />
            <v-select v-model="taskForm.priority" :items="['low', 'medium', 'high', 'critical']" label="Priority" />
            <v-select v-model="taskForm.status" :items="['todo', 'in_progress', 'done', 'archived']" label="Status" />
            <v-select v-model="taskForm.project" :items="projects" item-title="name" item-value="id" label="Project" clearable />
            <v-text-field v-model="taskForm.dueDate" label="Due date" type="date" />

            <div class="d-flex flex-wrap ga-2 mb-2">
              <v-btn :loading="loading" @click="reloadAll">GET /tasks</v-btn>
              <v-btn color="primary" :loading="loading" @click="createTask">POST /tasks</v-btn>
              <v-btn :loading="loading" @click="getTask">GET /tasks/{id}</v-btn>
              <v-btn :loading="loading" @click="putTask">PUT /tasks/{id}</v-btn>
              <v-btn :loading="loading" @click="patchTask">PATCH /tasks/{id}</v-btn>
              <v-btn color="error" :loading="loading" @click="deleteTask">DELETE /tasks/{id}</v-btn>
            </div>

            <div class="d-flex flex-wrap ga-2">
              <v-btn variant="outlined" :loading="loading" @click="runTaskWorkflow('startTask', 'PATCH /tasks/{id}/start')">/start</v-btn>
              <v-btn variant="outlined" :loading="loading" @click="runTaskWorkflow('completeTask', 'PATCH /tasks/{id}/complete')">/complete</v-btn>
              <v-btn variant="outlined" :loading="loading" @click="runTaskWorkflow('archiveTask', 'PATCH /tasks/{id}/archive')">/archive</v-btn>
              <v-btn variant="outlined" :loading="loading" @click="runTaskWorkflow('reopenTask', 'PATCH /tasks/{id}/reopen')">/reopen</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Task requests (all endpoints)</v-card-title>
          <v-card-text>
            <v-select v-model="selectedTaskRequestId" :items="taskRequests" item-title="id" item-value="id" label="Request cible" clearable />
            <v-select v-model="requestForm.task" :items="tasks" item-title="title" item-value="id" label="Task" />
            <v-select v-model="requestForm.requestedStatus" :items="['todo', 'in_progress', 'done', 'archived']" label="Requested status" />
            <v-select v-model="requestForm.status" :items="['pending', 'approved', 'rejected', 'cancelled']" label="Status (PUT)" />
            <v-textarea v-model="requestForm.note" label="Note" rows="2" />

            <div class="d-flex flex-wrap ga-2 mb-2">
              <v-btn :loading="loading" @click="reloadAll">GET /task-requests</v-btn>
              <v-btn color="primary" :loading="loading" @click="createTaskRequest">POST /task-requests</v-btn>
              <v-btn :loading="loading" @click="getTaskRequest">GET /task-requests/{id}</v-btn>
              <v-btn :loading="loading" @click="putTaskRequest">PUT /task-requests/{id}</v-btn>
              <v-btn :loading="loading" @click="patchTaskRequest">PATCH /task-requests/{id}</v-btn>
              <v-btn color="error" :loading="loading" @click="deleteTaskRequest">DELETE /task-requests/{id}</v-btn>
            </div>

            <div class="d-flex flex-wrap ga-2">
              <v-btn variant="outlined" :loading="loading" @click="runTaskRequestWorkflow('approveTaskRequest', 'PATCH /task-requests/{id}/approve')">/approve</v-btn>
              <v-btn variant="outlined" :loading="loading" @click="runTaskRequestWorkflow('rejectTaskRequest', 'PATCH /task-requests/{id}/reject')">/reject</v-btn>
              <v-btn variant="outlined" :loading="loading" @click="runTaskRequestWorkflow('cancelTaskRequest', 'PATCH /task-requests/{id}/cancel')">/cancel</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

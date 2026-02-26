<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { canManageProject, canManageTask, type ProjectPermissionSubject, type TaskManagerUser } from '~/utils/permissions/task-manager'

type ProjectDetailsState = 'loading' | 'empty' | 'error' | 'success'

interface ProjectTask {
  id: string
  title: string
  assigneeId?: string | null
}

const props = defineProps<{ projectId: string }>()
const authStore = useAuthStore()

const state = ref<ProjectDetailsState>('loading')
const project = ref<ProjectPermissionSubject>({ ownerId: '12', managerIds: ['34'] })
const tasks = ref<ProjectTask[]>([])
const projectDeniedMessage = 'Action interdite : vous ne pouvez pas gérer ce projet.'
const taskDeniedMessage = 'Action interdite : vous ne pouvez pas éditer/supprimer cette tâche.'

const currentUser = computed<TaskManagerUser>(() => ({
  id: authStore.profile?.id ?? '99',
  roles: authStore.roles,
}))

function isForbiddenError(errorValue: unknown) {
  return Boolean(errorValue && typeof errorValue === 'object' && 'status' in errorValue && errorValue.status === 403)
}

function fakeApi(action: 'edit' | 'delete', task?: ProjectTask) {
  return new Promise<void>((resolve, reject) => {
    window.setTimeout(() => {
      if (action === 'delete' && task?.id === 'P-TASK-2') {
        reject({ status: 403, message: 'Forbidden' })
        return
      }
      resolve()
    }, 200)
  })
}

async function editTask(task: ProjectTask) {
  if (!canManageTask(currentUser.value, task, project.value)) {
    Notify.error(taskDeniedMessage)
    return
  }

  try {
    await fakeApi('edit', task)
    Notify.success(`Tâche « ${task.title} » éditée.`)
  } catch (errorValue) {
    if (isForbiddenError(errorValue)) {
      Notify.error('Édition refusée (403). Aucun changement appliqué.')
      return
    }
    Notify.error('Impossible d\'éditer la tâche.')
  }
}

async function deleteTask(task: ProjectTask) {
  if (!canManageTask(currentUser.value, task, project.value)) {
    Notify.error(taskDeniedMessage)
    return
  }

  const previous = [...tasks.value]
  tasks.value = tasks.value.filter((entry) => entry.id !== task.id)

  try {
    await fakeApi('delete', task)
    Notify.success(`Tâche « ${task.title} » supprimée.`)
  } catch (errorValue) {
    tasks.value = previous
    if (isForbiddenError(errorValue)) {
      Notify.error('Suppression refusée (403). Liste inchangée.')
      return
    }
    Notify.error('Impossible de supprimer la tâche.')
  }
}

function load(stateMode: ProjectDetailsState = 'success') {
  state.value = 'loading'

  window.setTimeout(() => {
    state.value = stateMode
    tasks.value = stateMode === 'success'
      ? [
          { id: 'P-TASK-1', title: 'Kick-off équipe', assigneeId: '12' },
          { id: 'P-TASK-2', title: 'Cadrage UX', assigneeId: '34' },
          { id: 'P-TASK-3', title: 'Livrable Sprint 1', assigneeId: '99' },
        ]
      : []
  }, 500)
}

watch(() => props.projectId, () => load('success'), { immediate: true })
</script>

<template>
  <v-container class="py-6">
    <div class="d-flex align-center justify-space-between mb-4 ga-2 flex-wrap">
      <h1 class="text-h5">Projet {{ projectId }}</h1>
      <div class="d-flex ga-2 flex-wrap">
        <v-tooltip :text="canManageProject(currentUser, project) ? '' : projectDeniedMessage">
          <template #activator="{ props: tooltipProps }">
            <span v-bind="tooltipProps">
              <v-btn variant="tonal" color="primary" :disabled="!canManageProject(currentUser, project)">
                Gérer le projet
              </v-btn>
            </span>
          </template>
        </v-tooltip>
        <v-btn variant="text" prepend-icon="mdi-sync" @click="load('success')">Reload</v-btn>
        <v-btn variant="text" @click="load('empty')">Simuler empty</v-btn>
        <v-btn variant="text" color="error" @click="load('error')">Simuler error</v-btn>
      </div>
    </div>

    <div v-if="state === 'loading'" class="d-flex flex-column ga-3">
      <v-skeleton-loader type="article, list-item-three-line" />
      <v-progress-circular indeterminate color="primary" size="24" class="mx-auto" />
    </div>

    <v-alert v-else-if="state === 'empty'" type="info" variant="tonal" border="start">
      Ce projet ne contient encore aucune donnée affichable.
    </v-alert>

    <v-alert v-else-if="state === 'error'" type="error" variant="tonal" border="start">
      Une erreur est survenue lors du chargement du projet.
      <template #append>
        <v-btn size="small" color="error" variant="outlined" @click="load('success')">Réessayer</v-btn>
      </template>
    </v-alert>

    <v-card v-else>
      <v-card-title>Détails du projet</v-card-title>
      <v-card-text>
        <p class="mb-3">Identifiant : <strong>{{ projectId }}</strong></p>
        <v-list density="compact" lines="one">
          <v-list-item v-for="task in tasks" :key="task.id" prepend-icon="mdi-check-circle-outline" :title="task.title">
            <template #append>
              <div class="d-flex ga-2">
                <v-tooltip :text="canManageTask(currentUser, task, project) ? '' : taskDeniedMessage">
                  <template #activator="{ props: tooltipProps }">
                    <span v-bind="tooltipProps">
                      <v-btn size="x-small" variant="outlined" :disabled="!canManageTask(currentUser, task, project)" @click="editTask(task)">Edit</v-btn>
                    </span>
                  </template>
                </v-tooltip>
                <v-tooltip :text="canManageTask(currentUser, task, project) ? '' : taskDeniedMessage">
                  <template #activator="{ props: tooltipProps }">
                    <span v-bind="tooltipProps">
                      <v-btn size="x-small" variant="outlined" color="error" :disabled="!canManageTask(currentUser, task, project)" @click="deleteTask(task)">Delete</v-btn>
                    </span>
                  </template>
                </v-tooltip>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

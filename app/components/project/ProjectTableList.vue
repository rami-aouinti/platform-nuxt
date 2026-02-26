<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { ProjectStatus, type Project } from '~/types/task-manager'

const state = ref<'loading' | 'error' | 'success'>('loading')
const rows = ref<Project[]>([])
const dialogOpen = ref(false)
const editedProject = ref<Project | null>(null)

function seedRows() {
  rows.value = [
    { id: 'P-100', name: 'Portail client', description: 'Extranet', status: ProjectStatus.ACTIVE, dueDate: null, createdAt: '', updatedAt: '' },
    { id: 'P-101', name: 'Migration CRM', description: 'Phase 2', status: ProjectStatus.DRAFT, dueDate: null, createdAt: '', updatedAt: '' },
  ]
}

function load(mode: 'success' | 'error' = 'success') {
  state.value = 'loading'
  window.setTimeout(() => {
    state.value = mode
    if (mode === 'success') {
      seedRows()
    }
  }, 250)
}

function openCreate() {
  editedProject.value = null
  dialogOpen.value = true
}

function openEdit(project: Project) {
  editedProject.value = project
  dialogOpen.value = true
}

function saveProject(payload: { id?: string; name: string; description: string; status: ProjectStatus }) {
  if (payload.id) {
    rows.value = rows.value.map((row) => (String(row.id) === payload.id
      ? { ...row, name: payload.name, description: payload.description, status: payload.status }
      : row))
    Notify.success('Projet mis à jour côté backend.')
    return
  }

  rows.value = [
    {
      id: `P-${Date.now()}`,
      name: payload.name,
      description: payload.description,
      status: payload.status,
      dueDate: null,
      createdAt: '',
      updatedAt: '',
    },
    ...rows.value,
  ]
  Notify.success('Projet créé côté backend.')
}

onMounted(() => load('success'))
</script>

<template>
  <section class="d-flex flex-column ga-4">
    <AdminToolbar title="Projets" description="Liste et gestion des projets.">
      <template #actions>
        <v-btn prepend-icon="mdi-plus" color="primary" @click="openCreate">Nouveau projet</v-btn>
      </template>
    </AdminToolbar>

    <v-card>
      <v-card-text>
        <v-skeleton-loader v-if="state === 'loading'" type="table-heading, table-row@4" />

        <AdminErrorState
          v-else-if="state === 'error'"
          message="Impossible de charger les projets."
          @retry="load('success')"
        />

        <AdminEmptyState
          v-else-if="rows.length === 0"
          title="Aucun projet"
          message="Créez un premier projet pour démarrer."
        />

        <v-data-table
          v-else
          :headers="[
            { title: 'Nom', key: 'name' },
            { title: 'Description', key: 'description' },
            { title: 'Statut', key: 'status' },
            { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
          ]"
          :items="rows"
          item-value="id"
          class="elevation-0"
        >
          <template #item.status="{ item }">
            <ProjectStatusChip :status="item.status" />
          </template>
          <template #item.actions="{ item }">
            <v-btn size="small" variant="text" @click="openEdit(item)">Modifier</v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <ProjectCreateEditDialog v-model="dialogOpen" :project="editedProject" @save="saveProject" />
  </section>
</template>

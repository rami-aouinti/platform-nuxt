<script setup lang="ts">
type ProjectsViewState = 'loading' | 'empty' | 'error' | 'success'

interface ProjectRow {
  id: string
  name: string
  owner: string
  status: 'Actif' | 'En pause' | 'Terminé'
}

const state = ref<ProjectsViewState>('loading')
const rows = ref<ProjectRow[]>([])

const headers = [
  { title: 'Projet', key: 'name' },
  { title: 'Responsable', key: 'owner' },
  { title: 'Statut', key: 'status' },
  { title: 'Action', key: 'actions', sortable: false },
]

function load(stateMode: ProjectsViewState = 'success') {
  state.value = 'loading'

  window.setTimeout(() => {
    state.value = stateMode

    rows.value = stateMode === 'success'
      ? [
          { id: 'PRJ-101', name: 'Portail client', owner: 'Lucie Martin', status: 'Actif' },
          { id: 'PRJ-102', name: 'Refonte onboarding', owner: 'Amine B.', status: 'En pause' },
        ]
      : []
  }, 500)
}

onMounted(() => load('success'))
</script>

<template>
  <v-container class="py-6">
    <div class="d-flex align-center justify-space-between mb-4 ga-2 flex-wrap">
      <h1 class="text-h5">Projects</h1>
      <div class="d-flex ga-2 flex-wrap">
        <v-btn variant="text" prepend-icon="mdi-sync" @click="load('success')">Reload</v-btn>
        <v-btn variant="text" @click="load('empty')">Simuler empty</v-btn>
        <v-btn variant="text" color="error" @click="load('error')">Simuler error</v-btn>
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
        <v-btn size="small" color="error" variant="outlined" @click="load('success')">Réessayer</v-btn>
      </template>
    </v-alert>

    <v-data-table v-else :headers="headers" :items="rows" item-value="id" class="elevation-1">
      <template #item.actions="{ item }">
        <v-btn size="small" color="primary" variant="text" :to="`/projects/${item.id}`">Voir</v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

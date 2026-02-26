<script setup lang="ts">
type TaskRequestsState = 'loading' | 'empty' | 'error' | 'success'

interface TaskRequestRow {
  id: string
  title: string
  requester: string
  priority: 'Low' | 'Medium' | 'High'
}

const state = ref<TaskRequestsState>('loading')
const rows = ref<TaskRequestRow[]>([])

const headers = [
  { title: 'Demande', key: 'title' },
  { title: 'Demandeur', key: 'requester' },
  { title: 'Priorité', key: 'priority' },
]

function load(stateMode: TaskRequestsState = 'success') {
  state.value = 'loading'

  window.setTimeout(() => {
    state.value = stateMode
    rows.value = stateMode === 'success'
      ? [
          { id: 'REQ-1', title: 'Créer dashboard projet', requester: 'Sarah K.', priority: 'High' },
          { id: 'REQ-2', title: 'Ajouter exports CSV', requester: 'Marc R.', priority: 'Medium' },
        ]
      : []
  }, 500)
}

onMounted(() => load('success'))
</script>

<template>
  <v-container class="py-6">
    <div class="d-flex align-center justify-space-between mb-4 ga-2 flex-wrap">
      <h1 class="text-h5">Task requests</h1>
      <div class="d-flex ga-2 flex-wrap">
        <v-btn variant="text" prepend-icon="mdi-sync" @click="load('success')">Reload</v-btn>
        <v-btn variant="text" @click="load('empty')">Simuler empty</v-btn>
        <v-btn variant="text" color="error" @click="load('error')">Simuler error</v-btn>
      </div>
    </div>

    <div v-if="state === 'loading'" class="d-flex flex-column ga-3">
      <v-skeleton-loader type="table-heading, table-row-divider@3" />
      <v-progress-circular indeterminate color="primary" size="24" class="mx-auto" />
    </div>

    <v-alert v-else-if="state === 'empty'" type="info" variant="tonal" border="start">
      Aucune demande de tâche en attente.
    </v-alert>

    <v-alert v-else-if="state === 'error'" type="error" variant="tonal" border="start">
      Le chargement des demandes a échoué.
      <template #append>
        <v-btn size="small" color="error" variant="outlined" @click="load('success')">Réessayer</v-btn>
      </template>
    </v-alert>

    <v-data-table v-else :headers="headers" :items="rows" item-value="id" class="elevation-1" />
  </v-container>
</template>

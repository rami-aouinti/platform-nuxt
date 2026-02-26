<script setup lang="ts">
type TasksState = 'loading' | 'empty' | 'error' | 'success'

interface KanbanColumn {
  title: string
  tasks: string[]
}

const state = ref<TasksState>('loading')
const columns = ref<KanbanColumn[]>([])

function load(stateMode: TasksState = 'success') {
  state.value = 'loading'

  window.setTimeout(() => {
    state.value = stateMode
    columns.value = stateMode === 'success'
      ? [
          { title: 'To do', tasks: ['Rédiger specs', 'Créer tickets techniques'] },
          { title: 'In progress', tasks: ['Développer API projet'] },
          { title: 'Done', tasks: ['Valider maquettes'] },
        ]
      : []
  }, 500)
}

onMounted(() => load('success'))
</script>

<template>
  <v-container class="py-6">
    <div class="d-flex align-center justify-space-between mb-4 ga-2 flex-wrap">
      <h1 class="text-h5">Tasks</h1>
      <div class="d-flex ga-2 flex-wrap">
        <v-btn variant="text" prepend-icon="mdi-sync" @click="load('success')">Reload</v-btn>
        <v-btn variant="text" @click="load('empty')">Simuler empty</v-btn>
        <v-btn variant="text" color="error" @click="load('error')">Simuler error</v-btn>
      </div>
    </div>

    <div v-if="state === 'loading'" class="d-flex flex-column ga-3">
      <v-skeleton-loader type="list-item-three-line, list-item-three-line, list-item-three-line" />
      <v-progress-circular indeterminate color="primary" size="24" class="mx-auto" />
    </div>

    <v-alert v-else-if="state === 'empty'" type="info" variant="tonal" border="start">
      Aucune tâche planifiée.
    </v-alert>

    <v-alert v-else-if="state === 'error'" type="error" variant="tonal" border="start">
      Impossible de récupérer les tâches.
      <template #append>
        <v-btn size="small" color="error" variant="outlined" @click="load('success')">Réessayer</v-btn>
      </template>
    </v-alert>

    <v-row v-else>
      <v-col v-for="column in columns" :key="column.title" cols="12" md="4">
        <v-card class="h-100">
          <v-card-title>{{ column.title }}</v-card-title>
          <v-divider />
          <v-list>
            <v-list-item v-for="task in column.tasks" :key="task" :title="task" prepend-icon="mdi-checkbox-marked-circle-outline" />
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

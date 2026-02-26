<script setup lang="ts">
type ProjectDetailsState = 'loading' | 'empty' | 'error' | 'success'

const props = defineProps<{ projectId: string }>()

const state = ref<ProjectDetailsState>('loading')
const tasks = ref<string[]>([])

function load(stateMode: ProjectDetailsState = 'success') {
  state.value = 'loading'

  window.setTimeout(() => {
    state.value = stateMode
    tasks.value = stateMode === 'success'
      ? ['Kick-off équipe', 'Cadrage UX', 'Livrable Sprint 1']
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
          <v-list-item v-for="task in tasks" :key="task" prepend-icon="mdi-check-circle-outline" :title="task" />
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

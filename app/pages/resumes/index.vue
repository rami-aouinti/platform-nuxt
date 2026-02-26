<script setup lang="ts">
import { Notify } from '~/stores/notification'
import type { Resume } from '~/composables/useResumeApi'

definePageMeta({
  title: 'Mes CV',
  icon: 'mdi-file-document-multiple-outline',
  drawerIndex: 24,
  requiresAuth: true,
  middleware: ['auth'],
})

const { getMyResumes, deleteResume } = useResumeApi()

const loading = ref(false)
const deletingId = ref<string | null>(null)
const rows = ref<Resume[]>([])

function toErrorMessage(errorValue: unknown) {
  if (errorValue instanceof Error) return errorValue.message
  return 'Une erreur API est survenue.'
}

async function loadResumes() {
  loading.value = true
  try {
    const response = await getMyResumes({ limit: 50, order: 'updatedAt:desc' })
    rows.value = response.data || []
  } catch (errorValue) {
    Notify.error(toErrorMessage(errorValue))
  } finally {
    loading.value = false
  }
}

async function removeResume(id: string) {
  deletingId.value = id
  try {
    await deleteResume(id)
    Notify.success('CV supprimé.')
    await loadResumes()
  } catch (errorValue) {
    Notify.error(toErrorMessage(errorValue))
  } finally {
    deletingId.value = null
  }
}

onMounted(loadResumes)
</script>

<template>
  <v-container class="py-6">
    <div class="d-flex align-center justify-space-between mb-4 ga-3 flex-wrap">
      <h1 class="text-h5">Mes CV</h1>
      <div class="d-flex ga-2">
        <v-btn :loading="loading" :disabled="loading" prepend-icon="mdi-refresh" variant="text" @click="loadResumes">Rafraîchir</v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" to="/resumes/new">Nouveau CV</v-btn>
      </div>
    </div>

    <v-progress-linear v-if="loading" indeterminate class="mb-4" />

    <v-alert v-if="!loading && !rows.length" type="info" variant="tonal">Aucun CV pour le moment.</v-alert>

    <v-row>
      <v-col v-for="resume in rows" :key="resume.id" cols="12" md="6" lg="4">
        <v-card>
          <v-card-title>{{ resume.title || 'Sans titre' }}</v-card-title>
          <v-card-subtitle>{{ resume.headline || 'Aucune accroche' }}</v-card-subtitle>
          <v-card-text>{{ resume.location || 'Lieu non renseigné' }}</v-card-text>
          <v-card-actions>
            <v-btn variant="text" color="primary" :to="`/resumes/${resume.id}`">Ouvrir</v-btn>
            <v-spacer />
            <v-btn
              color="error"
              variant="text"
              prepend-icon="mdi-delete"
              :loading="deletingId === resume.id"
              :disabled="Boolean(deletingId)"
              @click="removeResume(resume.id)"
            >
              Supprimer
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

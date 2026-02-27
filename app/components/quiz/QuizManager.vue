<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Quiz, QuizPayload } from '~/types/quiz'
import { useQuizzesStore } from '~/stores/quizzes'

const quizzesStore = useQuizzesStore()
const { rows: quizzes, loading, error: storeError } = storeToRefs(quizzesStore)

const saving = ref(false)
const deletingId = ref<string | null>(null)
const errorMessage = ref('')

const isDialogOpen = ref(false)
const editingId = ref<string | null>(null)

const form = reactive<QuizPayload>({
  title: '',
  description: '',
  isPublished: false,
})

const headers = [
  { title: 'Titre', key: 'title' },
  { title: 'Description', key: 'description' },
  { title: 'Publié', key: 'isPublished' },
  { title: 'Actions', key: 'actions', sortable: false },
]

function resetForm() {
  form.title = ''
  form.description = ''
  form.isPublished = false
}

function openCreateDialog() {
  editingId.value = null
  resetForm()
  isDialogOpen.value = true
}

function openEditDialog(quiz: Quiz) {
  editingId.value = quiz.id
  form.title = quiz.title
  form.description = quiz.description ?? ''
  form.isPublished = Boolean(quiz.isPublished)
  isDialogOpen.value = true
}

async function loadQuizzes() {
  errorMessage.value = ''

  try {
    await quizzesStore.fetchRows()
  } catch {
    errorMessage.value = storeError.value ?? 'Impossible de charger les quizzes.'
  }
}

async function saveQuiz() {
  saving.value = true
  errorMessage.value = ''

  try {
    if (editingId.value) {
      await quizzesStore.update(editingId.value, form)
    } else {
      await quizzesStore.create(form)
    }

    isDialogOpen.value = false
  } catch {
    errorMessage.value = storeError.value ?? 'Impossible d\'enregistrer le quiz.'
  } finally {
    saving.value = false
  }
}

async function deleteQuiz(id: string) {
  deletingId.value = id
  errorMessage.value = ''

  try {
    await quizzesStore.remove(id)
  } catch {
    errorMessage.value = storeError.value ?? 'Impossible de supprimer le quiz.'
  } finally {
    deletingId.value = null
  }
}

onMounted(loadQuizzes)
</script>

<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <span>Quiz</span>
      <v-btn color="primary" @click="openCreateDialog">Nouveau quiz</v-btn>
    </v-card-title>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mx-4 mb-2">
      {{ errorMessage }}
    </v-alert>

    <v-data-table :headers="headers" :items="quizzes" :loading="loading" item-value="id">
      <template #item.isPublished="{ item }">
        <v-chip :color="item.isPublished ? 'success' : 'default'" size="small">
          {{ item.isPublished ? 'Oui' : 'Non' }}
        </v-chip>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex ga-2">
          <v-btn size="small" variant="tonal" @click="openEditDialog(item)">Éditer</v-btn>
          <v-btn
            size="small"
            color="error"
            variant="tonal"
            :loading="deletingId === item.id"
            @click="deleteQuiz(item.id)"
          >
            Supprimer
          </v-btn>
        </div>
      </template>
    </v-data-table>

    <v-dialog v-model="isDialogOpen" max-width="600">
      <v-card>
        <v-card-title>{{ editingId ? 'Modifier un quiz' : 'Créer un quiz' }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="form.title" label="Titre" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="form.description" label="Description" />
            </v-col>
            <v-col cols="12">
              <v-switch v-model="form.isPublished" label="Publié" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="isDialogOpen = false">Annuler</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveQuiz">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

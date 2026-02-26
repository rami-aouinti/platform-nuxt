<script setup lang="ts">
import { Notify } from '~/stores/notification'
import type { CreateResumePayload } from '~/composables/useResumeApi'

definePageMeta({
  title: 'Nouveau CV',
  icon: 'mdi-file-plus-outline',
  requiresAuth: true,
  middleware: ['auth'],
})

const { createResume } = useResumeApi()
const router = useRouter()

const loading = ref(false)
const form = ref<CreateResumePayload>({
  title: '',
  headline: '',
  summary: '',
  location: '',
})

function toErrorMessage(errorValue: unknown) {
  if (errorValue instanceof Error) return errorValue.message
  return 'Une erreur API est survenue.'
}

async function submit() {
  if (!form.value.title?.trim()) {
    Notify.error('Le titre est obligatoire.')
    return
  }

  loading.value = true
  try {
    const resume = await createResume({
      title: form.value.title.trim(),
      headline: form.value.headline,
      summary: form.value.summary,
      location: form.value.location,
    })

    Notify.success('CV créé.')
    await router.push(`/resumes/${resume.id}`)
  } catch (errorValue) {
    Notify.error(toErrorMessage(errorValue))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="py-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h1 class="text-h5">Créer un CV</h1>
      <v-btn variant="text" to="/resumes">Retour à la liste</v-btn>
    </div>

    <v-card>
      <v-card-text>
        <ResumeForm v-model="form" :disabled="loading" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" :loading="loading" :disabled="loading" @click="submit">Créer</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

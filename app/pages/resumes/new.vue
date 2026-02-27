<script setup lang="ts">
import { Notify } from '~/stores/notification'
import type { CreateResumePayload } from '~/composables/useResumeApi'

definePageMeta({
  title: 'Nouveau CV',
  icon: 'mdi-file-plus-outline',
  requiresAuth: true,
  middleware: ['auth'],
})

const resumeStore = useResumeStore()
const router = useRouter()

const loading = computed(() => resumeStore.loadingByAction.saveResume || false)
const isResumeFormValid = ref(false)
const resumeFormRef = ref()
const form = ref<CreateResumePayload>({
  title: '',
  headline: '',
  summary: '',
  location: '',
  isPublic: false,
})

async function submit() {
  const validationResult = await resumeFormRef.value?.validate()
  if (!validationResult?.valid) {
    Notify.error('Le formulaire contient des erreurs. Merci de les corriger avant de soumettre.')
    return
  }

  const resume = await resumeStore.saveResume({
    title: form.value.title.trim(),
    headline: form.value.headline,
    summary: form.value.summary,
    location: form.value.location,
    isPublic: Boolean(form.value.isPublic),
  })

  await router.push(`/resumes/${resume.id}`)
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
        <v-form ref="resumeFormRef" v-model="isResumeFormValid">
          <ResumeForm v-model="form" :disabled="loading" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" :loading="loading" :disabled="loading || !isResumeFormValid" @click="submit">Créer</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

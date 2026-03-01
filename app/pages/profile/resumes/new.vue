<script setup lang="ts">
import { useResumeStore } from '~/stores/resume'
import { notifyFormValidationError } from '~/stores/_factories/storeNotifications'
import type { ResumeFormModel } from '~/types/resume'

definePageMeta({
  title: 'Nouveau CV',
  icon: 'mdi-file-plus-outline',
  requiresAuth: true,
  middleware: ['auth'],
  alias: ['/profile/resumes/new'],
})

const { t } = useI18n()
const resumeStore = useResumeStore()
const router = useRouter()

const loading = computed(() => resumeStore.loadingByAction.saveResume || false)
const isResumeFormValid = ref(false)
const resumeFormRef = ref()
const form = ref<ResumeFormModel>({
  title: '',
  headline: '',
  summary: '',
  location: '',
  isPublic: false,
})

async function submit() {
  const validationResult = await resumeFormRef.value?.validate()
  if (!validationResult?.valid) {
    notifyFormValidationError('Le formulaire')
    return
  }

  const resume = await resumeStore.saveResumeFromForm(form.value)

  await router.push(`/profile/resumes/${resume.id}`)
}
</script>

<template>
  <v-container class="py-6">
    <div class="d-flex align-center justify-space-between mb-4">
      <h1 class="text-h5">{{ t('profile.resumePages.createTitle') }}</h1>
      <v-btn variant="text" to="/profile/resumes">{{ t('profile.resumePages.backToList') }}</v-btn>
    </div>

    <v-card>
      <v-card-text>
        <v-form ref="resumeFormRef" v-model="isResumeFormValid">
          <ResumeForm v-model="form" :disabled="loading" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" :loading="loading" :disabled="loading || !isResumeFormValid" @click="submit">{{ t('profile.resumePages.create') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

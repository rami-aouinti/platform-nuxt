<script setup lang="ts">
import { useResumeStore } from '~/stores/resume'

const { t } = useI18n()
const resumeStore = useResumeStore()
const loading = computed(() => resumeStore.loadingByAction.fetchResumeList || false)
const deletingId = ref<string | null>(null)

async function loadResumes() {
  await resumeStore.fetchResumeList()
}

async function removeResume(id: string) {
  deletingId.value = id
  try {
    await resumeStore.deleteResume(id)
  } finally {
    deletingId.value = null
  }
}

onMounted(loadResumes)
</script>

<template>
  <v-card class="profile-block pa-4 pa-md-6" rounded="xl" elevation="0">
    <div class="d-flex align-center justify-space-between mb-4 ga-3 flex-wrap">
      <h3 class="text-h4 text-typo mb-0">{{ t('profile.resumePages.listTitle') }}</h3>
      <div class="d-flex ga-2">
        <v-btn :loading="loading" :disabled="loading" prepend-icon="mdi-refresh" variant="text" @click="loadResumes">
          {{ t('profile.resumePages.refresh') }}
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" to="/profile/resumes/new">
          {{ t('profile.resumePages.newResume') }}
        </v-btn>
      </div>
    </div>

    <v-progress-linear v-if="loading" indeterminate class="mb-4" />

    <v-alert v-if="!loading && !resumeStore.resumeList.length" type="info" variant="tonal" class="mb-4">
      {{ t('profile.resumePages.empty') }}
    </v-alert>

    <v-row>
      <v-col
        v-for="resume in resumeStore.resumeList"
        :key="resume.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card variant="outlined" rounded="lg" class="h-100">
          <v-card-title>{{ resume.title || t('profile.resumePages.untitled') }}</v-card-title>
          <v-card-subtitle>{{ resume.headline || t('profile.resumePages.noHeadline') }}</v-card-subtitle>
          <v-card-text>{{ resume.location || t('profile.resumePages.locationUnknown') }}</v-card-text>
          <v-card-actions>
            <v-btn variant="text" color="primary" :to="`/profile/resumes/${resume.id}`">
              {{ t('profile.resumePages.open') }}
            </v-btn>
            <v-spacer />
            <v-btn
              color="error"
              variant="text"
              prepend-icon="mdi-delete"
              :loading="deletingId === resume.id"
              :disabled="Boolean(deletingId)"
              @click="removeResume(resume.id)"
            >
              {{ t('profile.resumePages.delete') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

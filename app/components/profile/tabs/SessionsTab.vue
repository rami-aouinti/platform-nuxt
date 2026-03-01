<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'

type SessionItem = {
  id: string
  title: string
  description?: string
  location?: string
  active?: boolean
  deviceType?: 'desktop' | 'mobile'
}

const authStore = useAuthStore()
const loading = ref(false)
const sessions = ref<SessionItem[]>([])

async function loadSessions() {
  if (!authStore.token) {
    return
  }

  loading.value = true
  const endpoints = ['/api/v1/me/sessions', '/api/v2/me/sessions']

  try {
    for (const endpoint of endpoints) {
      try {
        const response = await $fetch<SessionItem[] | { items?: SessionItem[] }>(endpoint, {
          headers: { Authorization: `Bearer ${authStore.token}` },
        })

        sessions.value = Array.isArray(response) ? response : (response.items ?? [])
        return
      } catch {
        continue
      }
    }

    sessions.value = []
  } catch (error) {
    Notify.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(loadSessions)
</script>

<template>
  <v-card class="profile-block pa-4 pa-md-6" rounded="xl" elevation="0">
    <h3 class="text-h4 text-typo mb-2">Sessions</h3>
    <p class="text-body-1 text-medium-emphasis mb-6">This is a list of devices that have logged into your account. Remove those that you do not recognize.</p>

    <div v-if="loading" class="d-flex align-center ga-3">
      <v-progress-circular indeterminate size="24" color="primary" />
      <span>Chargement...</span>
    </div>

    <v-alert v-else-if="sessions.length === 0" type="info" variant="tonal">Aucune session distante trouvée.</v-alert>

    <div v-else class="d-flex flex-column ga-4">
      <div v-for="session in sessions" :key="session.id" class="d-flex align-center ga-4 py-2">
        <v-icon :icon="session.deviceType === 'mobile' ? 'mdi-cellphone' : 'mdi-monitor'" size="28" class="text-medium-emphasis" />
        <div>
          <p class="text-h6 mb-1">{{ session.title }}</p>
          <p v-if="session.description" class="text-body-2 text-medium-emphasis mb-0">{{ session.description }}</p>
        </div>
        <v-chip v-if="session.active" color="success" variant="tonal" class="ms-auto">Active</v-chip>
        <p class="text-medium-emphasis mb-0" :class="session.active ? '' : 'ms-auto'">{{ session.location || '-' }}</p>
        <v-btn variant="text" color="secondary">See more</v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { getProfileEndpointCandidates } from '~/services/profile/profile-endpoint-resolver'

type NotificationRow = {
  key: string
  title: string
  description?: string
  email: boolean
  push: boolean
  sms: boolean
}

const authStore = useAuthStore()
const loading = ref(false)
const saving = ref(false)

const rows = ref<NotificationRow[]>([
  { key: 'mentions', title: 'Mentions', description: 'Notify when another user mentions you in a comment', email: true, push: false, sms: false },
  { key: 'comments', title: 'Comments', description: 'Notify when another user comments your item', email: true, push: true, sms: false },
  { key: 'follows', title: 'Follows', description: 'Notify when another user follows you', email: false, push: true, sms: false },
  { key: 'new-device', title: 'Log in from a new device', email: true, push: true, sms: true },
])

async function loadSettings() {
  if (!authStore.token) {
    return
  }

  loading.value = true

  const endpoints = getProfileEndpointCandidates('notifications')

  try {
    for (const endpoint of endpoints) {
      try {
        const response = await $fetch<{ items?: Partial<NotificationRow>[] }>(endpoint, {
          headers: { Authorization: `Bearer ${authStore.token}` },
        })

        if (!response.items?.length) {
          continue
        }

        const byKey = new Map(response.items.map(item => [item.key, item]))
        rows.value = rows.value.map((row) => ({
          ...row,
          ...byKey.get(row.key),
        }))
        return
      } catch {
        continue
      }
    }
  } finally {
    loading.value = false
  }
}

async function saveSettings() {
  if (!authStore.token) {
    return
  }

  saving.value = true
  const endpoints = getProfileEndpointCandidates('notifications')

  try {
    for (const endpoint of endpoints) {
      try {
        await $fetch(endpoint, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${authStore.token}` },
          body: { items: rows.value },
        })
        Notify.success('Préférences de notification mises à jour.')
        return
      } catch {
        continue
      }
    }
    throw new Error('Aucun endpoint de sauvegarde des notifications disponible.')
  } catch (error) {
    Notify.error(error)
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)
</script>

<template>
  <v-card class="profile-block pa-4 pa-md-6" rounded="xl" elevation="0">
    <h3 class="text-h4 text-typo mb-2">Notifications</h3>
    <p class="text-body-1 text-medium-emphasis mb-6">Choose how you receive notifications. These notification settings apply to the things you're watching.</p>

    <div v-if="loading" class="d-flex align-center ga-3">
      <v-progress-circular indeterminate size="24" color="primary" />
      <span>Chargement...</span>
    </div>

    <v-table v-else>
      <thead>
        <tr>
          <th>Activity</th>
          <th class="text-center">Email</th>
          <th class="text-center">Push</th>
          <th class="text-center">SMS</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.key">
          <td>
            <p class="text-h6 text-typo mb-1">{{ row.title }}</p>
            <p v-if="row.description" class="text-body-2 text-medium-emphasis mb-0">{{ row.description }}</p>
          </td>
          <td class="text-center"><v-switch v-model="row.email" inset hide-details /></td>
          <td class="text-center"><v-switch v-model="row.push" inset hide-details /></td>
          <td class="text-center"><v-switch v-model="row.sms" inset hide-details /></td>
        </tr>
      </tbody>
    </v-table>

    <div class="d-flex justify-end mt-4">
      <v-btn color="primary" :loading="saving" @click="saveSettings">Save preferences</v-btn>
    </div>
  </v-card>
</template>

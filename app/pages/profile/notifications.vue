<script setup lang="ts">
definePageMeta({
  icon: 'mdi-bell-outline',
  title: 'Notifications',
  middleware: 'auth',
  requiresAuth: true,
})

type UserNotification = {
  id: string
  title: string
  message: string
  readAt: string | null
}

const notifications = ref<UserNotification[]>([])
const loading = ref(false)

function normalizeNotifications(payload: unknown): UserNotification[] {
  if (!Array.isArray(payload)) {
    return []
  }

  return payload.map((entry, index) => {
    const row = entry && typeof entry === 'object'
      ? entry as Record<string, unknown>
      : {}

    return {
      id: String(row.id ?? index),
      title: String(row.title ?? ''),
      message: String(row.message ?? ''),
      readAt: typeof row.readAt === 'string' ? row.readAt : null,
    }
  })
}

async function loadNotifications() {
  loading.value = true

  try {
    const response = await $fetch('/api/v1/me/notifications')
    notifications.value = normalizeNotifications(response)
  } finally {
    loading.value = false
  }
}

onMounted(loadNotifications)
</script>

<template>
  <v-container fluid class="pa-6">
    <v-card rounded="lg" elevation="4" class="pa-6 workspace-sidebar-card">
      <div class="d-flex align-center justify-space-between mb-4">
        <h1 class="text-h4 font-weight-bold">Toutes les notifications</h1>
      </div>

      <v-progress-linear v-if="loading" indeterminate class="mb-4" />

      <v-list v-if="notifications.length" lines="three">
        <v-list-item
          v-for="notification in notifications"
          :key="notification.id"
          :to="`/profile/notifications/${notification.id}`"
          :class="{ 'profile-notification--unread': !notification.readAt }"
        >
          <v-list-item-title class="font-weight-bold">{{ notification.title }}</v-list-item-title>
          <v-list-item-subtitle class="text-wrap">{{ notification.message }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-alert
        v-else-if="!loading"
        type="info"
        variant="tonal"
        text="Aucune notification pour le moment."
      />
    </v-card>
  </v-container>
</template>

<style scoped>
.profile-notification--unread {
  background-color: rgba(var(--v-theme-primary), 0.08);
  border-radius: 12px;
}
</style>

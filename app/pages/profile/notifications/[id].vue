<script setup lang="ts">
definePageMeta({
  icon: 'mdi-bell-outline',
  title: 'Détail notification',
  middleware: 'auth',
  requiresAuth: true,
})

type UserNotificationDetail = {
  id: string
  title: string
  message: string
  readAt: string | null
  type: string
}

const route = useRoute()
const notification = ref<UserNotificationDetail | null>(null)
const loading = ref(false)

const notificationId = computed(() => {
  const value = (route.params as Record<string, string | string[] | undefined>).id
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
})

function normalizeNotification(payload: unknown): UserNotificationDetail {
  const row = payload && typeof payload === 'object'
    ? payload as Record<string, unknown>
    : {}

  return {
    id: String(row.id ?? notificationId.value),
    title: String(row.title ?? ''),
    message: String(row.message ?? ''),
    readAt: typeof row.readAt === 'string' ? row.readAt : null,
    type: String(row.type ?? ''),
  }
}

async function loadNotification() {
  if (!notificationId.value) {
    return
  }

  loading.value = true

  try {
    const response = await $fetch(`/api/v1/me/notifications/${encodeURIComponent(notificationId.value)}`)
    notification.value = normalizeNotification(response)
  } finally {
    loading.value = false
  }
}

onMounted(loadNotification)
</script>

<template>
  <v-container fluid class="pa-6">
    <v-card rounded="xl" elevation="4" class="pa-6">
      <div class="d-flex align-center justify-space-between mb-4">
        <h1 class="text-h4 font-weight-bold">Notification</h1>
        <v-btn variant="text" to="/profile/notifications">Retour</v-btn>
      </div>

      <v-progress-linear v-if="loading" indeterminate class="mb-4" />

      <template v-else-if="notification">
        <h2 class="text-h5 font-weight-bold mb-2">{{ notification.title }}</h2>
        <v-chip
          :color="notification.readAt ? 'default' : 'primary'"
          size="small"
          variant="tonal"
          class="mb-4"
        >
          {{ notification.readAt ? 'Lu' : 'Nouveau' }}
        </v-chip>
        <p class="text-body-1 mb-4">{{ notification.message }}</p>
        <p v-if="notification.type" class="text-body-2 text-medium-emphasis">Type : {{ notification.type }}</p>
      </template>

      <v-alert
        v-else
        type="warning"
        variant="tonal"
        text="Notification introuvable."
      />
    </v-card>
  </v-container>
</template>

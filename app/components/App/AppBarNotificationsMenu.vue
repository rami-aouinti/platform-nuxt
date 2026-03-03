<script setup lang="ts">
type UserNotification = {
  id: string
  title: string
  message: string
  type: string
  readAt: string | null
}

const props = defineProps<{
  isAuthenticated: boolean
  notifications: UserNotification[]
  unreadCount: number
  notificationsLoading: boolean
  openNotificationsAriaLabel: string
}>()

const emit = defineEmits<{
  open: []
}>()

const latestNotifications = computed(() => props.notifications.slice(0, 3))
const hasUnreadNotifications = computed(() => props.unreadCount > 0)

function handleMenuOpen(opened: boolean) {
  if (opened) {
    emit('open')
  }
}

function getNotificationIcon(type: string) {
  if (type.includes('company')) return 'mdi-domain'
  if (type.includes('application') && type.includes('submitted')) {
    return 'mdi-file-document-plus-outline'
  }
  if (type.includes('application') && type.includes('decided')) {
    return 'mdi-check-decagram-outline'
  }
  return 'mdi-bell-outline'
}

function getNotificationMeta(notification: UserNotification) {
  return notification.readAt ? 'Lu' : 'Nouveau'
}

function getNotificationPreview(message: string) {
  return message.length > 64 ? `${message.slice(0, 64)}…` : message
}
</script>

<template>
  <v-menu
    v-if="isAuthenticated"
    location="bottom"
    :offset="8"
    @update:model-value="handleMenuOpen"
  >
    <template #activator="{ props: menuProps }">
      <UiButton
        icon
        class="ml-1"
        variant="text"
        :aria-label="openNotificationsAriaLabel"
        v-bind="menuProps"
      >
        <v-badge
          :model-value="hasUnreadNotifications"
          :content="unreadCount"
          color="error"
          offset-x="3"
          offset-y="3"
        >
          <v-icon icon="mdi-bell" size="26" aria-hidden="true" />
        </v-badge>
      </UiButton>
    </template>

    <v-card class="app-bar__notifications-menu" elevation="12" rounded="xl">
      <v-progress-linear
        v-if="notificationsLoading"
        indeterminate
        color="primary"
        height="3"
      />

      <v-list
        v-if="latestNotifications.length"
        class="py-2"
        bg-color="transparent"
      >
        <v-list-item
          v-for="notification in latestNotifications"
          :key="notification.id"
          :to="`/profile/notifications/${notification.id}`"
          class="app-bar__notification-item"
        >
          <template #prepend>
            <div class="app-bar__notification-avatar">
              <v-icon
                :icon="getNotificationIcon(notification.type)"
                size="20"
                color="white"
              />
            </div>
          </template>

          <v-list-item-title class="app-bar__notification-title">
            {{ notification.title }}
          </v-list-item-title>

          <v-list-item-subtitle class="app-bar__notification-preview">
            {{ getNotificationPreview(notification.message) }}
          </v-list-item-subtitle>

          <div class="app-bar__notification-meta">
            <v-icon icon="mdi-clock-time-four-outline" size="14" />
            <span>{{ getNotificationMeta(notification) }}</span>
          </div>

          <template #append>
            <span
              v-if="!notification.readAt"
              class="app-bar__notification-dot"
            />
          </template>
        </v-list-item>
      </v-list>

      <div v-else class="text-medium-emphasis text-body-2 px-4 py-6">
        Aucune notification
      </div>

      <v-divider />
      <v-list bg-color="transparent" class="py-0">
        <v-list-item
          to="/profile/notifications"
          class="font-weight-bold"
          title="All"
          append-icon="mdi-chevron-right"
        />
      </v-list>
    </v-card>
  </v-menu>
</template>

<style scoped>
.app-bar__notifications-menu {
  width: min(420px, calc(100vw - 24px));
  overflow: hidden;
}

.app-bar__notification-item {
  margin: 4px 10px;
  border-radius: 14px;
  padding-inline: 10px;
}

.app-bar__notification-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgb(74, 85, 104), rgb(45, 55, 72));
  display: grid;
  place-items: center;
  margin-right: 10px;
}

.app-bar__notification-title {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 700;
}

.app-bar__notification-preview {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.app-bar__notification-meta {
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 0.82rem;
}

.app-bar__notification-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background-color: rgb(var(--v-theme-primary));
  display: inline-block;
}
</style>

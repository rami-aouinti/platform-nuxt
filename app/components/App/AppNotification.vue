<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Notify, useNotificationStore } from '~/stores/notification'
import { useInternalEventTracking } from '~/composables/useInternalEventTracking'

const { t } = useI18n()
const notificationStore = useNotificationStore()
const { notifications } = storeToRefs(notificationStore)
const notificationsShown = computed(() =>
  notifications.value.filter((notification) => notification.show).reverse(),
)
const showAll = ref(false)
const dialogReadAll = useTemplateRef('dialogReadAll')
const timeout = computed(() => (showAll.value ? -1 : 5000))

const { track } = useInternalEventTracking()
function deleteNotification(id: number) {
  notificationStore.delNotification(id)
}
async function emptyNotifications() {
  const confirmed = await dialogReadAll.value?.open(
    'Marquer toutes les notifications comme lues/vidées ?',
  )

  if (!confirmed) {
    return
  }

  const countBeforeReset = notifications.value.length
  notificationStore.$reset()
  Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.notificationsMarkedRead')))
  track({
    name: 'admin.notifications.read-all',
    payload: {
      count: countBeforeReset,
    },
  })
}
function toggleAll() {
  showAll.value = !showAll.value
  notifications.value.forEach((m: { show: boolean }) => {
    m.show = showAll.value
  })
}
</script>

<template>
  <v-tooltip
    :text="t('appbar.accessibility.openNotificationsPanel')"
    eager
    :activator-props="{ 'aria-describedby': undefined }"
  >
    <template #activator="{ props: tooltip }">
      <v-btn
        :icon="
          notifications.length ? 'mdi-bell-badge-outline' : 'mdi-bell-outline'
        "
        :rounded="0"
        :aria-label="t('appbar.accessibility.openNotificationsPanel')"
        v-bind="tooltip"
        @click="toggleAll"
      />
    </template>
  </v-tooltip>
  <DialogConfirm ref="dialogReadAll" />
  <ClientOnly>
    <teleport to="body">
      <v-card
        elevation="6"
        width="400"
        class="d-flex flex-column notification-card"
        :class="{ 'notification-card--open': showAll }"
      >
        <v-toolbar flat density="compact">
          <v-toolbar-title
            class="font-weight-light text-body-1"
            :text="
              notifications.length ? 'Notification' : 'No New Notifications'
            "
          />
          <v-tooltip
            :text="t('appbar.accessibility.clearAllNotifications')"
            eager
            :activator-props="{ 'aria-describedby': undefined }"
          >
            <template #activator="{ props: tooltip }">
              <v-btn
                size="small"
                icon="mdi-bell-remove"
                :aria-label="t('appbar.accessibility.clearAllNotifications')"
                v-bind="tooltip"
                @click="emptyNotifications"
              />
            </template>
          </v-tooltip>
          <v-tooltip
            :text="t('appbar.accessibility.hideNotificationsPanel')"
            eager
            :activator-props="{ 'aria-describedby': undefined }"
          >
            <template #activator="{ props: tooltip }">
              <v-btn
                class="mr-0"
                size="small"
                icon="$expand"
                :aria-label="t('appbar.accessibility.hideNotificationsPanel')"
                v-bind="tooltip"
                @click="toggleAll"
              />
            </template>
          </v-tooltip>
        </v-toolbar>
        <v-slide-y-reverse-transition
          tag="div"
          class="d-flex flex-column notification-box"
          group
          hide-on-leave
        >
          <div
            v-for="notification in notificationsShown"
            :key="notification.id"
            class="notification-item-wrapper"
          >
            <AppNotificationItem
              v-model="notification.show"
              :notification="notification"
              :timeout="timeout"
              class="notification-item"
              @close="deleteNotification(notification.id)"
            />
          </div>
        </v-slide-y-reverse-transition>
      </v-card>
    </teleport>
  </ClientOnly>
</template>

<style scoped>
.notification-item {
  width: 100%;
  border: 0;
}
.notification-card {
  z-index: 1;
  position: fixed;
  right: 15px;
  bottom: 48px;
  max-height: 100vh;
  overflow: visible;
  visibility: hidden;
  &.notification-card--open {
    visibility: visible;
    overflow: hidden;
    max-height: calc(100vh - 200px);
    .notification-box {
      overflow-y: overlay;
      pointer-events: auto;
      .notification-item-wrapper {
        transition: none !important;
        .notification-item {
          margin-bottom: 0;
          border-radius: 0;
          border-top: 1px solid #5656563d !important;
        }
      }
    }
  }
}
.notification-box {
  overflow-y: visible;
  visibility: visible;
  pointer-events: none;
  .notification-item {
    pointer-events: initial;
    user-select: initial;
    margin-bottom: 10px;
  }
}
</style>

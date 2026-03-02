<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

import type { HTMLAttributes } from 'vue'

const theme = useTheme()
const drawer = useState('drawer')
const route = useRoute()
withDefaults(
  defineProps<{
    showDrawerToggle?: boolean
    showBrandLink?: boolean
    showBreadcrumbs?: boolean
    floating?: boolean
  }>(),
  {
    showDrawerToggle: true,
    showBrandLink: false,
    showBreadcrumbs: true,
    floating: false,
  },
)
const { t, locale, locales, setLocale } = useI18n()
const breadcrumbs = computed(() => {
  return route!.matched
    .filter((item) => item.meta && item.meta.title)
    .map((r) => ({
      title: r.meta.title!,
      disabled: r.path === route.path || false,
      to: r.path,
    }))
})
const isDark = computed({
  get() {
    return theme.current.value.dark
  },
  set(v) {
    theme.change(v ? 'dark' : 'light')
  },
})
const authStore = useAuthStore()
const { isAuthenticated, profile, hasAdminAccess, rolesLoading, initialized } =
  storeToRefs(authStore)

type UserNotification = {
  id: string
  title: string
  message: string
  readAt: string | null
}

const notifications = ref<UserNotification[]>([])
const unreadCount = ref(0)
const notificationsLoading = ref(false)

const latestNotifications = computed(() => notifications.value.slice(0, 3))
const hasUnreadNotifications = computed(() => unreadCount.value > 0)

const localeFlags: Record<string, string> = {
  en: '/flags/en.svg',
  de: '/flags/de.svg',
  fr: '/flags/fr.svg',
}

const languageOptions = computed(() =>
  locales.value.map((entry) => {
    if (typeof entry === 'string') {
      return {
        code: entry,
        name: entry.toUpperCase(),
        flag: localeFlags[entry] ?? '/flags/en.svg',
      }
    }

    return {
      code: entry.code,
      name: entry.name ?? entry.code.toUpperCase(),
      flag: localeFlags[entry.code] ?? '/flags/en.svg',
    }
  }),
)

const currentLanguageFlag = computed(() => {
  const selected = languageOptions.value.find(
    (item) => item.code === locale.value,
  )
  return selected?.flag ?? '/flags/en.svg'
})

const userDisplayName = computed(() => {
  const currentProfile = profile.value

  if (!currentProfile) {
    return 'User'
  }

  const fullName =
    `${currentProfile.firstName ?? ''} ${currentProfile.lastName ?? ''}`.trim()

  return fullName || currentProfile.username || 'User'
})

function logout() {
  authStore.logout()
}

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

function normalizeUnreadCount(payload: unknown): number {
  if (!payload || typeof payload !== 'object') {
    return 0
  }

  const value = Number((payload as { unread?: unknown }).unread)
  return Number.isFinite(value) ? Math.max(0, value) : 0
}

async function loadNotifications() {
  if (!isAuthenticated.value) {
    notifications.value = []
    unreadCount.value = 0
    return
  }

  notificationsLoading.value = true

  try {
    const [notificationsResponse, unreadCountResponse] = await Promise.all([
      $fetch('/api/v1/me/notifications'),
      $fetch('/api/v1/me/notifications/unread-count'),
    ])

    notifications.value = normalizeNotifications(notificationsResponse)
    unreadCount.value = normalizeUnreadCount(unreadCountResponse)
  } finally {
    notificationsLoading.value = false
  }
}

async function handleNotificationMenuOpen() {
  if (!isAuthenticated.value) {
    return
  }

  await loadNotifications()

  if (!hasUnreadNotifications.value) {
    return
  }

  await $fetch('/api/v1/me/notifications/read-all', { method: 'PATCH' })
  notifications.value = notifications.value.map(notification => ({
    ...notification,
    readAt: notification.readAt ?? new Date().toISOString(),
  }))
  unreadCount.value = 0
}

function createActivatorProps(
  menu: HTMLAttributes,
  tooltip: HTMLAttributes,
): HTMLAttributes {
  const menuOnClick = menu.onClick
  const tooltipOnClick = tooltip.onClick

  return {
    ...menu,
    ...tooltip,
    onClick(event: Event) {
      if (typeof menuOnClick === 'function') {
        menuOnClick(event as PointerEvent)
      }

      if (typeof tooltipOnClick === 'function') {
        tooltipOnClick(event as PointerEvent)
      }
    },
  }
}

watch(isAuthenticated, (value) => {
  if (!value) {
    notifications.value = []
    unreadCount.value = 0
    return
  }

  loadNotifications()
}, { immediate: true })
</script>

<template>
  <v-app-bar
    flat
    :class="{
      'app-bar--floating': floating,
    }"
  >
    <v-app-bar-nav-icon v-if="showDrawerToggle" @click="drawer = !drawer" />
    <NuxtLink v-if="showBrandLink" to="/" class="app-bar__brand">
      <v-icon
        icon="custom:vitify-nuxt"
        size="x-large"
        color="primary"
        class="app-bar__brand-icon"
      />
      <span class="text-h6 font-weight-bold text-high-emphasis">
        Bro<span class="text-primary">World</span>
      </span>
    </NuxtLink>
    <v-breadcrumbs v-if="showBreadcrumbs" :items="breadcrumbs" />
    <v-spacer />
    <div id="app-bar" class="app-bar__portal" />
    <v-spacer />
    <div class="app-bar__right-actions d-flex align-center">
      <v-switch
        v-model="isDark"
        color=""
        hide-details
        density="compact"
        inset
        false-icon="mdi-white-balance-sunny"
        true-icon="mdi-weather-night"
        class="opacity-80"
      />
      <UiButton
        icon
        href="https://github.com/rami-aouinti/platform-nuxt"
        size="sm"
        class="ml-2"
        target="_blank"
        variant="text"
      >
        <v-icon size="26" icon="mdi-github" />
      </UiButton>
      <v-menu location="bottom" @update:model-value="(opened) => opened && handleNotificationMenuOpen()">
        <template #activator="{ props }">
          <UiButton icon class="ml-1" variant="text" v-bind="props">
            <v-badge
              :model-value="hasUnreadNotifications"
              :content="unreadCount"
              color="error"
              offset-x="2"
              offset-y="2"
            >
              <v-icon icon="mdi-bell" size="28" />
            </v-badge>
          </UiButton>
        </template>

        <v-list density="compact" min-width="360">
          <v-progress-linear v-if="notificationsLoading" indeterminate height="2" class="mb-1" />
          <v-list-subheader>Notifications</v-list-subheader>
          <template v-if="latestNotifications.length">
            <v-list-item
              v-for="notification in latestNotifications"
              :key="notification.id"
              :to="`/profile/notifications/${notification.id}`"
              :class="{ 'app-bar__notification--unread': !notification.readAt }"
            >
              <v-list-item-title class="font-weight-bold">{{ notification.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ notification.message.slice(0, 72) }}{{ notification.message.length > 72 ? '…' : '' }}</v-list-item-subtitle>
            </v-list-item>
          </template>
          <v-list-item v-else>
            <v-list-item-title class="text-medium-emphasis">Aucune notification</v-list-item-title>
          </v-list-item>
          <v-divider class="my-1" />
          <v-list-item to="/profile/notifications" title="All" append-icon="mdi-chevron-right" />
        </v-list>
      </v-menu>
      <v-menu location="bottom">
        <template #activator="{ props: menu }">
          <v-tooltip location="bottom">
            <template #activator="{ props: tooltip }">
              <UiButton
                icon
                v-bind="createActivatorProps(menu, tooltip)"
                class="ml-1"
                variant="text"
              >
                <v-icon icon="mdi-account-circle" size="36" />
              </UiButton>
            </template>
            <span>{{ userDisplayName }}</span>
          </v-tooltip>
        </template>
        <v-list>
          <v-list-item
            v-if="!isAuthenticated"
            :title="t('appbar.login')"
            prepend-icon="mdi-login"
            to="/login"
          />
          <v-list-item
            v-else
            :title="t('appbar.profile')"
            prepend-icon="mdi-account"
            to="/profile"
          />
          <v-list-item
            v-if="isAuthenticated"
            :title="t('appbar.crm')"
            prepend-icon="mdi-account-group-outline"
            to="/crm"
          />
          <v-list-item
            v-if="isAuthenticated"
            :title="t('appbar.calendar')"
            prepend-icon="mdi-calendar-month-outline"
            to="/calendar"
          />
          <v-list-item
            v-if="isAuthenticated"
            :title="t('appbar.quiz')"
            prepend-icon="mdi-help-circle-outline"
            to="/quiz"
          />
          <v-list-item
            v-if="
              isAuthenticated && initialized && !rolesLoading && hasAdminAccess
            "
            :title="t('appbar.administration')"
            prepend-icon="mdi-shield-account-outline"
            to="/admin"
          />
          <v-list-item
            v-if="isAuthenticated"
            :title="t('appbar.logout')"
            prepend-icon="mdi-logout"
            @click="logout"
          />
        </v-list>
      </v-menu>
      <v-menu location="bottom end">
        <template #activator="{ props }">
          <UiButton
            variant="text"
            class="mr-2"
            aria-label="Language"
            v-bind="props"
          >
            <img
              :src="currentLanguageFlag"
              alt=""
              class="app-bar__language-flag"
            />
          </UiButton>
        </template>

        <v-list density="compact">
          <v-list-item
            v-for="language in languageOptions"
            :key="language.code"
            :active="language.code === locale"
            :aria-label="language.name"
            @click="setLocale(language.code)"
          >
            <v-list-item-title>
              <img :src="language.flag" alt="" class="app-bar__language-flag" />
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<style scoped>
.app-bar--floating {
  margin: 10px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
}

.app-bar__right-actions {
  flex-shrink: 0;
}

.app-bar--floating .app-bar__brand {
  margin-inline-start: 10px;
}

.app-bar__brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
}

.app-bar__brand-icon {
  margin-right: -2px;
}

.app-bar__language-flag {
  width: 22px;
  height: 15px;
  object-fit: cover;
  border-radius: 2px;
  display: block;
}

.app-bar__notification--unread {
  background-color: rgba(var(--v-theme-primary), 0.08);
  border-radius: 10px;
}

@media (max-width: 960px) {
  .app-bar--floating {
    top: 8px;
    width: calc(100% - 16px);
    border-radius: 14px;
  }
}
</style>

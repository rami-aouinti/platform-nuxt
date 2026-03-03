<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { defineAsyncComponent, mergeProps } from 'vue'
import { useAuthStore } from '~/stores/auth'

const AppBarNotificationsMenu = defineAsyncComponent(
  () => import('~/components/App/AppBarNotificationsMenu.vue'),
)
const AppBarInboxMenu = defineAsyncComponent(
  () => import('~/components/App/AppBarInboxMenu.vue'),
)

const theme = useTheme()
const drawer = useState('drawer')
const route = useRoute()
const appBarProps = withDefaults(
  defineProps<{
    showDrawerToggle?: boolean
    showBrandLink?: boolean
    showBreadcrumbs?: boolean
    floating?: boolean
    showSecondaryActionsOnHome?: boolean
  }>(),
  {
    showDrawerToggle: true,
    showBrandLink: false,
    showBreadcrumbs: true,
    floating: false,
    showSecondaryActionsOnHome: false,
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

const isHomeRoute = computed(() => route.path === '/')
const secondaryActionsOpened = ref(false)
const showSecondaryActions = computed(
  () => !isHomeRoute.value || secondaryActionsOpened.value || appBarProps.showSecondaryActionsOnHome,
)

const isDark = computed({
  get() {
    return theme.current.value.dark
  },
  set(v) {
    theme.change(v ? 'dark' : 'light')
  },
})
const themeToggleAriaLabel = computed(() =>
  isDark.value
    ? t('appbar.accessibility.toggleLightTheme')
    : t('appbar.accessibility.toggleDarkTheme'),
)
const authStore = useAuthStore()
const { isAuthenticated, profile, hasAdminAccess, rolesLoading, initialized } =
  storeToRefs(authStore)

type UserNotification = {
  id: string
  title: string
  message: string
  type: string
  readAt: string | null
}

const notifications = ref<UserNotification[]>([])
const unreadCount = ref(0)
const notificationsLoading = ref(false)

const hasUnreadNotifications = computed(() => unreadCount.value > 0)

type ChatConversation = import('~/composables/api/useChatApi').ChatConversation

const inboxConversations = ref<ChatConversation[]>([])
const inboxLoading = ref(false)
const chatApi = shallowRef<{
  listConversations: () => Promise<ChatConversation[]>
} | null>(null)

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

    const code = String(entry.code)

    return {
      code,
      name: entry.name ?? code.toUpperCase(),
      flag: localeFlags[code] ?? '/flags/en.svg',
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
    const row =
      entry && typeof entry === 'object'
        ? (entry as Record<string, unknown>)
        : {}

    return {
      id: String(row.id ?? index),
      title: String(row.title ?? ''),
      message: String(row.message ?? ''),
      type: String(row.type ?? ''),
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

function isHttp401(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  const statusCode = (error as { statusCode?: unknown }).statusCode
  const status = (error as { status?: unknown }).status

  return statusCode === 401 || status === 401
}

async function fetchWith401Retry<T>(request: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let attempt = 0

  while (true) {
    try {
      return await request()
    } catch (error) {
      attempt += 1

      if (!isHttp401(error) || attempt >= maxAttempts) {
        throw error
      }
    }
  }
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
      fetchWith401Retry(() => $fetch('/api/v1/me/notifications')),
      fetchWith401Retry(() => $fetch('/api/v1/me/notifications/unread-count')),
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

  await fetchWith401Retry(() =>
    $fetch('/api/v1/me/notifications/read-all', { method: 'PATCH' }),
  )
  notifications.value = notifications.value.map((notification) => ({
    ...notification,
    readAt: notification.readAt ?? new Date().toISOString(),
  }))
  unreadCount.value = 0
}

async function getChatApi() {
  if (!chatApi.value) {
    const { useChatApi } = await import('~/composables/api/useChatApi')
    chatApi.value = useChatApi()
  }

  return chatApi.value
}

async function loadInboxConversations() {
  if (!isAuthenticated.value) {
    inboxConversations.value = []
    return
  }

  inboxLoading.value = true

  try {
    const api = await getChatApi()
    inboxConversations.value = await fetchWith401Retry(() => api.listConversations())
  } catch (error) {
    inboxConversations.value = []
    console.warn('Unable to load inbox conversations.', error)
  } finally {
    inboxLoading.value = false
  }
}

watch(
  isAuthenticated,
  (value) => {
    if (!value) {
      notifications.value = []
      unreadCount.value = 0
      inboxConversations.value = []
      return
    }

  },
  { immediate: true },
)
</script>

<template>
  <v-app-bar
    flat
    :class="{
      'app-bar--floating': floating,
    }"
  >
    <v-app-bar-nav-icon
      v-if="showDrawerToggle"
      :aria-label="t('appbar.accessibility.openNavigation')"
      @click="drawer = !drawer"
    />
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

    <UiButton
      v-if="isHomeRoute && !showSecondaryActions"
      variant="text"
      class="mr-2"
      :aria-label="t('appbar.accessibility.openUserMenu')"
      @click="secondaryActionsOpened = true"
    >
      <v-icon icon="mdi-dots-horizontal" size="24" aria-hidden="true" />
    </UiButton>

    <div
      v-if="showSecondaryActions"
      class="app-bar__right-actions d-flex align-center"
    >
      <v-switch
        v-model="isDark"
        :aria-label="themeToggleAriaLabel"
        color=""
        hide-details
        density="compact"
        inset
        false-icon="mdi-white-balance-sunny"
        true-icon="mdi-weather-night"
        class="opacity-80"
      />

      <component
        :is="AppBarNotificationsMenu"
        :is-authenticated="isAuthenticated"
        :notifications="notifications"
        :unread-count="unreadCount"
        :notifications-loading="notificationsLoading"
        :open-notifications-aria-label="
          t('appbar.accessibility.openNotifications')
        "
        @open="handleNotificationMenuOpen"
      />

      <component
        :is="AppBarInboxMenu"
        :is-authenticated="isAuthenticated"
        :inbox-loading="inboxLoading"
        :inbox-conversations="inboxConversations"
        :open-chat-aria-label="t('appbar.accessibility.openChat')"
        @open="loadInboxConversations"
      />
      <UiButton
        icon
        href="https://github.com/rami-aouinti/platform-nuxt"
        size="sm"
        class="ml-2"
        target="_blank"
        variant="text"
        :aria-label="`${t('appbar.accessibility.openGithub')} (öffnet in neuem Tab)`"
        :title="`${t('appbar.accessibility.openGithub')} (öffnet in neuem Tab)`"
      >
        <v-icon size="26" icon="mdi-github" aria-hidden="true" />
      </UiButton>
      <v-menu location="bottom">
        <template #activator="{ props: menu }">
          <v-tooltip
            location="bottom"
            eager
          >
            <template #activator="{ props: tooltip }">
              <UiButton
                icon
                v-bind="mergeProps(menu, tooltip)"
                class="ml-1"
                variant="text"
                :aria-label="t('appbar.accessibility.openUserMenu')"
              >
                <v-icon
                  icon="mdi-account-circle"
                  size="36"
                  aria-hidden="true"
                />
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
            :title="t('appbar.applications')"
            prepend-icon="mdi-apps"
            to="/applications"
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
            :aria-label="t('appbar.accessibility.openLanguageMenu')"
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

@media (max-width: 960px) {
  .app-bar--floating {
    top: 8px;
    width: calc(100% - 16px);
    border-radius: 14px;
  }
}
</style>

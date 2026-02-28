<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

import type { HTMLAttributes } from 'vue'

const theme = useTheme()
const drawer = useState('drawer')
const route = useRoute()
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
const { isAuthenticated, profile, hasAdminAccess, rolesLoading } =
  storeToRefs(authStore)

const languageOptions = computed(() =>
  locales.value.map((entry) => {
    if (typeof entry === 'string') {
      return {
        code: entry,
        name: entry.toUpperCase(),
      }
    }

    return {
      code: entry.code,
      name: entry.name ?? entry.code.toUpperCase(),
    }
  }),
)

const currentLanguageName = computed(() => {
  const selected = languageOptions.value.find((item) => item.code === locale.value)
  return selected?.name ?? locale.value.toUpperCase()
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
</script>

<template>
  <v-app-bar flat>
    <v-app-bar-nav-icon @click="drawer = !drawer" />
    <v-breadcrumbs :items="breadcrumbs" />
    <v-spacer />
    <div id="app-bar" class="app-bar__portal" />
    <v-spacer />
    <div class="app-bar__right-actions d-flex align-center">
      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-btn variant="text" size="small" class="mr-2" v-bind="props">
            {{ currentLanguageName }}
            <v-icon size="18" icon="mdi-chevron-down" class="ml-1" />
          </v-btn>
        </template>

        <v-list density="compact">
          <v-list-item
            v-for="language in languageOptions"
            :key="language.code"
            :title="language.name"
            :active="language.code === locale"
            @click="setLocale(language.code)"
          />
        </v-list>
      </v-menu>
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
      <v-btn
        icon
        href="https://github.com/rami-aouinti/platform-nuxt"
        size="small"
        class="ml-2"
        target="_blank"
      >
        <v-icon size="26" icon="mdi-github" />
      </v-btn>
      <v-menu location="bottom">
        <template #activator="{ props: menu }">
          <v-tooltip location="bottom">
            <template #activator="{ props: tooltip }">
              <v-btn
                icon
                v-bind="createActivatorProps(menu, tooltip)"
                class="ml-1"
              >
                <v-icon icon="mdi-account-circle" size="36" />
              </v-btn>
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
            v-if="isAuthenticated && !rolesLoading && hasAdminAccess"
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
    </div>
  </v-app-bar>
</template>

<style scoped>
.app-bar__breadcrumbs--hidden {
  display: none;
}

.app-bar__right-actions {
  flex-shrink: 0;
}
</style>

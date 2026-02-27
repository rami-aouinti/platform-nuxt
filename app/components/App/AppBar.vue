<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

import type { HTMLAttributes } from 'vue'

const theme = useTheme()
const drawer = useState('drawer')
const route = useRoute()
const isAdministrationRoute = computed(() => route.path.startsWith('/admin') || route.path.startsWith('/administration'))
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
    <v-breadcrumbs :items="breadcrumbs" :class="{ 'app-bar__breadcrumbs--hidden': isAdministrationRoute }" />
    <v-spacer />
    <div id="app-bar" class="app-bar__portal" />
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
          title="Login"
          prepend-icon="mdi-login"
          to="/login"
        />
        <v-list-item
          v-else
          title="Profile"
          prepend-icon="mdi-account"
          to="/profile"
        />
        <v-list-item
          v-if="isAuthenticated"
          title="CRM"
          prepend-icon="mdi-account-group-outline"
          to="/crm"
        />
        <v-list-item
          v-if="isAuthenticated"
          title="Calendar"
          prepend-icon="mdi-calendar-month-outline"
          to="/calendar"
        />
        <v-list-item
          v-if="isAuthenticated"
          title="Quiz"
          prepend-icon="mdi-help-circle-outline"
          to="/quiz"
        />
        <v-list-item
          v-if="isAuthenticated && !rolesLoading && hasAdminAccess"
          title="Administration"
          prepend-icon="mdi-shield-account-outline"
          to="/admin"
        />
        <v-list-item
          v-if="isAuthenticated"
          title="Logout"
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


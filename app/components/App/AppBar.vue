<script setup lang="ts">
import { mergeProps } from 'vue'

const theme = useTheme()
const drawer = useState('drawer')
const route = useRoute()
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
const { isAuthenticated, profile } = storeToRefs(authStore)

const userDisplayName = computed(() => {
  const currentProfile = profile.value

  if (!currentProfile) {
    return 'User'
  }

  const fullName = `${currentProfile.firstName ?? ''} ${currentProfile.lastName ?? ''}`.trim()

  return fullName || currentProfile.username || 'User'
})

function logout() {
  authStore.logout()
}
</script>

<template>
  <v-app-bar flat>
    <v-app-bar-nav-icon @click="drawer = !drawer" />
    <v-breadcrumbs :items="breadcrumbs" />
    <v-spacer />
    <div id="app-bar" />
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
      href="https://github.com/kingyue737/vitify-nuxt"
      size="small"
      class="ml-2"
      target="_blank"
    >
      <v-icon size="30" icon="mdi-github" />
    </v-btn>
    <v-menu location="bottom">
      <template #activator="{ props: menu }">
        <v-tooltip location="bottom">
          <template #activator="{ props: tooltip }">
            <v-btn icon v-bind="mergeProps(menu, tooltip)" class="ml-1">
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
          title="Logout"
          prepend-icon="mdi-logout"
          @click="logout"
        />
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

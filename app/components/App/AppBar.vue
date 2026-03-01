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

@media (max-width: 960px) {
  .app-bar--floating {
    top: 8px;
    width: calc(100% - 16px);
    border-radius: 14px;
  }
}
</style>

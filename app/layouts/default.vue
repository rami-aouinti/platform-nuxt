<script setup lang="ts">
import VercelAnalyticsPlaceholder from '~/components/layout/analytics/VercelAnalyticsPlaceholder'
import SpeedInsightsPlaceholder from '~/components/layout/analytics/SpeedInsightsPlaceholder'

const route = useRoute()
const isFloatingAppBar = computed(() => route.meta.appBarFloating !== false)
const showSecondaryActionsOnHome = computed(
  () => route.meta.appBarShowSecondaryActions === true,
)

const LazyAnalytics = defineAsyncComponent({
  loader: async () => {
    if (import.meta.server) {
      return VercelAnalyticsPlaceholder
    }

    const module = await import('@vercel/analytics/vue')
    return module.Analytics
  },
  suspensible: false,
})

const LazySpeedInsights = defineAsyncComponent({
  loader: async () => {
    if (import.meta.server) {
      return SpeedInsightsPlaceholder
    }

    const module = await import('@vercel/speed-insights/nuxt')
    return module.SpeedInsights
  },
  suspensible: false,
})
</script>
<template>
  <div class="default-layout">
    <AppBar
      :show-drawer-toggle="false"
      :show-breadcrumbs="false"
      :floating="isFloatingAppBar"
      :show-secondary-actions-on-home="showSecondaryActionsOnHome"
      show-brand-link
    />
    <v-main
      class="default-layout__main"
      :class="isFloatingAppBar ? 'md-main-offset--floating' : 'md-main-offset'"
    >
      <slot />
    </v-main>
    <AppFooter />
    <ClientOnly>
      <component :is="LazyAnalytics" v-if="shouldRenderAnalytics" />
      <component :is="LazySpeedInsights" v-if="shouldRenderSpeedInsights" />
    </ClientOnly>
  </div>
</template>

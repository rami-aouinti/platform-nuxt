<script setup lang="ts">
import VercelAnalyticsPlaceholder
  from "~/components/layout/analytics/VercelAnalyticsPlaceholder";
import SpeedInsightsPlaceholder from "~/components/layout/analytics/SpeedInsightsPlaceholder";
const LazyAnalytics = defineAsyncComponent({
  loader: async () => {
    if (import.meta.server) {
      return VercelAnalyticsPlaceholder;
    }

    const module = await import("@vercel/analytics/vue");
    return module.Analytics;
  },
  suspensible: false,
});

const LazySpeedInsights = defineAsyncComponent({
  loader: async () => {
    if (import.meta.server) {
      return SpeedInsightsPlaceholder;
    }

    const module = await import("@vercel/speed-insights/nuxt");
    return module.SpeedInsights;
  },
  suspensible: false,
});

</script>
<template>
  <div class="default-layout">
    <AppBar
      :show-drawer-toggle="false"
      :show-breadcrumbs="false"
      :floating="true"
      show-brand-link
    />
    <v-main>
      <slot />
    </v-main>
    <AppFooter />
    <ClientOnly>
      <component
        :is="LazyAnalytics"
        v-if="shouldRenderAnalytics"
      />
      <component
        :is="LazySpeedInsights"
        v-if="shouldRenderSpeedInsights"
      />
    </ClientOnly>
  </div>
</template>

<style scoped>
.default-layout-main {
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 64px;
  margin-bottom: 32px;
  height: calc(100vh - 64px - 32px);
  overflow-y: auto;
  transition-property: padding;
}
</style>

<script setup lang="ts">
import VercelAnalyticsPlaceholder
  from "~/components/layout/analytics/VercelAnalyticsPlaceholder";
import SpeedInsightsPlaceholder from "~/components/layout/analytics/SpeedInsightsPlaceholder";

const route = useRoute();
const isFloatingAppBar = computed(() => route.meta.appBarFloating !== false);

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
  <div
    class="default-layout"
    :class="{ 'default-layout--floating': isFloatingAppBar }"
  >
    <AppBar
      :show-drawer-toggle="false"
      :show-breadcrumbs="false"
      :floating="isFloatingAppBar"
      show-brand-link
    />
    <v-main class="default-layout__main">
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
.default-layout {
  --default-layout-app-bar-offset: 64px;
}

.default-layout--floating {
  --default-layout-app-bar-offset: 84px;
}

.default-layout__main {
  padding-top: var(--default-layout-app-bar-offset);
}

@media (max-width: 960px) {
  .default-layout {
    --default-layout-app-bar-offset: 56px;
  }

  .default-layout--floating {
    --default-layout-app-bar-offset: 72px;
  }
}
</style>

<script setup lang="ts">
const route = useRoute()

const items = computed(() =>
  route.matched
    ?.filter((v) => v.path === route.path)[0]
    ?.children.filter((c) => c.path)
    .toSorted(
      (a, b) => (a.meta?.drawerIndex ?? 99) - (b.meta?.drawerIndex ?? 98),
    )
    .map((c) => ({
      title: c.meta?.title,
      to: c.name ? c : `${route.path}/${c.path}`,
      prependIcon: c.meta?.icon,
      subtitle: c.meta?.subtitle,
    })),
)
</script>

<template>
  <v-container>
    <v-row>
      <v-col v-for="item in items" :key="item.title" cols="12" sm="6" md="4">
        <v-card :to="item.disabled ? undefined : item.to" class="stats-card v-alert--border-top" elevation="24">
          <v-card-title class="d-flex align-center ga-2">
            <v-icon color="primary" :icon="item.prependIcon" />
            <span>{{ item.title }}</span>
          </v-card-title>

          <v-card-text class="text-medium-emphasis">{{ item.subtitle }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.stats-card {
  padding: 5px;
  padding-top: 10px;
  .card-title {
    width: fit-content;
    .card-title--name {
      display: inline-block;
      backdrop-filter: blur(3px);
    }
  }
  .caption {
    font-size: 12px;
    letter-spacing: 0;
  }
  .stats-icon {
    position: absolute;
    opacity: 0.3;
  }
  .stats-footer {
    :deep(span) {
      display: inline-block;
      font-size: 12px !important;
      letter-spacing: 0 !important;
    }
  }
}
</style>

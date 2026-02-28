<script setup>
const props = defineProps({
  mapData: {
    type: Object,
    default: () => ({}),
  },
  points: {
    type: Array,
    default: () => [],
  },
})

const topCountries = computed(() =>
  Object.entries(props.mapData)
    .sort(([, a], [, b]) => Number(b) - Number(a))
    .slice(0, 6),
)
</script>

<template>
  <div class="world-map-placeholder pa-4 mb-4 rounded border">
    <div class="text-subtitle-2 mb-2">World map unavailable in legacy mode</div>
    <v-chip-group column>
      <v-chip
        v-for="([country, visits], index) in topCountries"
        :key="`${country}-${index}`"
        size="small"
        color="primary"
        variant="tonal"
      >
        {{ country }} · {{ visits }}
      </v-chip>
    </v-chip-group>
  </div>
</template>

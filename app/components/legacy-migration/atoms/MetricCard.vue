<template>
  <v-card class="card-shadow h-100">
    <v-card-text>
      <p class="text-sm text-body mb-1">{{ label }}</p>
      <h4 class="text-h4 text-typo mb-0">{{ value }}</h4>
      <p v-if="hint" class="text-xs text-success mt-2 mb-0">{{ hint }}</p>
      <slot />
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'MetricCard',
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
    hint: { type: String, default: '' },
  },
}
</script>

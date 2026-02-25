<script setup lang="ts">
const props = withDefaults(defineProps<{
  value?: number
  label?: string
}>(), {
  value: 86,
  label: 'Passt hervorragend',
})

const normalized = computed(() => Math.max(0, Math.min(100, props.value)))
</script>

<template>
  <div class="offer-match-gauge">
    <div class="offer-match-gauge__top">
      <span class="offer-match-gauge__label">{{ props.label }}</span>
      <span class="offer-match-gauge__value">{{ normalized }}%</span>
    </div>
    <div class="offer-match-gauge__bar">
      <span class="offer-match-gauge__fill" :style="{ width: `${normalized}%` }" />
    </div>
  </div>
</template>

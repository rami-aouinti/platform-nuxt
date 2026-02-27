<script setup lang="ts">
const props = withDefaults(defineProps<{
  items?: Array<{ label: string; value: number }>
  seriesName?: string
}>(), {
  items: () => [
    { label: 'Industries', value: 320 },
    { label: 'Technology', value: 240 },
    { label: 'Forex', value: 149 },
  ],
  seriesName: 'Distribution',
})

const option = computed<ECOption>(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
  },
  legend: {
    left: 'center',
    bottom: '10',
    data: props.items.map((item) => item.label),
  },
  series: [
    {
      name: props.seriesName,
      type: 'pie',
      roseType: 'radius',
      radius: [15, 95],
      center: ['50%', '38%'],
      data: props.items.map((item) => ({ value: item.value, name: item.label })),
      animationEasing: 'cubicInOut',
    },
  ],
}))
</script>

<template>
  <v-chart :option="option" autoresize />
</template>

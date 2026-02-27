<script setup lang="ts">
const props = withDefaults(defineProps<{
  items?: Array<{ label: string; value: number }>
  seriesName?: string
}>(), {
  items: () => [
    { label: 'Mon', value: 79 },
    { label: 'Tue', value: 52 },
    { label: 'Wed', value: 200 },
  ],
  seriesName: 'value',
})

const option = computed<ECOption>(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  grid: {
    top: 20,
    left: '2%',
    right: '2%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: [
    {
      type: 'category',
      data: props.items.map((item) => item.label),
      axisTick: {
        alignWithLabel: true,
      },
    },
  ],
  yAxis: [
    {
      type: 'value',
      axisTick: {
        show: false,
      },
    },
  ],
  series: [
    {
      name: props.seriesName,
      type: 'bar',
      barWidth: '60%',
      data: props.items.map((item) => item.value),
    },
  ],
}))
</script>

<template>
  <v-chart :option="option" autoresize />
</template>

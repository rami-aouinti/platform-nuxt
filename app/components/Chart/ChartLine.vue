<script setup lang="ts">
const props = withDefaults(defineProps<{
  points?: Array<{ date: string; value: number }>
  seriesName?: string
}>(), {
  points: () => [
    { date: '2022-06-05', value: 116 },
    { date: '2022-06-06', value: 129 },
    { date: '2022-06-07', value: 135 },
    { date: '2022-06-08', value: 86 },
    { date: '2022-06-09', value: 73 },
  ],
  seriesName: 'value',
})

const source = computed(() => props.points.map((point) => [point.date, point.value]))

const option = computed<ECOption>(() => ({
  backgroundColor: 'transparent',
  dataset: { source: source.value },
  tooltip: {
    trigger: 'axis',
  },
  grid: {
    top: 20,
    left: '2%',
    right: '2%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'time',
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: props.seriesName,
      type: 'line',
      showSymbol: false,
      lineStyle: {
        width: 4,
      },
    },
  ],
}))
</script>

<template>
  <v-chart :option="option" autoresize />
</template>

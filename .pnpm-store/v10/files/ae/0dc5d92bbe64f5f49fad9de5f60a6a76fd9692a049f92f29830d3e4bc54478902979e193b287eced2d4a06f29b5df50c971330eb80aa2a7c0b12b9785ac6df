<script setup>
import * as echarts from "echarts";
import { ref } from "vue";
const props = defineProps({
  option: { type: null, required: false },
  initOptions: { type: null, required: false },
  theme: { type: null, required: false }
});
const svgStr = ref("");
const initOptions = echarts.util.merge(
  { renderer: "svg", ssr: true },
  props.initOptions || {}
);
const chart = echarts.init(null, props.theme, initOptions);
chart.setOption(props.option || {});
svgStr.value = chart.renderToSVGString();
chart.dispose();
defineSlots();
</script>

<template>
  <div class="vue-echarts-container">
    <!--eslint-disable-next-line vue/no-v-html-->
    <div class="vue-echarts-inner" v-html="svgStr" />
  </div>
</template>

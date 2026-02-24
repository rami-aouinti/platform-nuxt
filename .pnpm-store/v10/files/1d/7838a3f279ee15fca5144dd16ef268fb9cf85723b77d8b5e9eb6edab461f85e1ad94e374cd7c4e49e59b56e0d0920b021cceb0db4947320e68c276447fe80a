<script setup>
import { computed, inject, ref, toValue } from "vue";
import { THEME_KEY, INIT_OPTIONS_KEY } from "vue-echarts";
const defaultTheme = inject(THEME_KEY, null);
const defaultInitOptions = inject(INIT_OPTIONS_KEY, null);
const props = defineProps({
  option: { type: null, required: false },
  theme: { type: null, required: false },
  initOptions: { type: null, required: false }
});
const emits = defineEmits(["error"]);
const realTheme = computed(() => props.theme || toValue(defaultTheme) || {});
const realInitOptions = computed(
  () => props.initOptions || toValue(defaultInitOptions) || {}
);
function onError(e) {
  if (e instanceof TypeError && e.message === "Cannot read properties of undefined (reading 'link')") {
    root.value?.refresh();
  }
  emits("error", e);
}
const root = ref(null);
</script>

<template>
  <div class="vue-echarts-server">
    <VChartIsland
      ref="root"
      :theme="realTheme"
      :option="option"
      :init-options="realInitOptions"
      @error="onError"
    >
      <template #fallback>
        <slot name="fallback" />
      </template>
    </VChartIsland>
  </div>
</template>

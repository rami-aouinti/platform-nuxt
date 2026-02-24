<script>
import {
  hydrate
} from "echarts/ssr/client/index";
import {
  useAttrs,
  nextTick,
  ref,
  onMounted,
  defineComponent
} from "vue";
export default defineComponent({
  inheritAttrs: false,
  props: {
    option: Object,
    theme: {
      type: [Object, String]
    },
    initOptions: Object
  },
  emits: {},
  setup() {
    const root = ref(null);
    const attrs = useAttrs();
    let container;
    function hydrateChart() {
      if (root.value?.$el) {
        container = root.value?.$el;
        hydrate(container, {
          on: {
            click: attrs.onClick,
            mouseout: attrs.onMouseout,
            mouseover: attrs.onMouseover
          }
        });
      }
    }
    let observer;
    onMounted(async () => {
      await nextTick();
      hydrateChart();
      observer = new MutationObserver(async () => {
        hydrateChart();
      });
      observer.observe(root.value.$el, {
        characterData: false,
        childList: true,
        attributes: false
      });
    });
    return { root };
  }
});
</script>

<template>
  <VChartServer
    ref="root"
    :option="option"
    :init-options="initOptions"
    :theme="theme"
  />
</template>

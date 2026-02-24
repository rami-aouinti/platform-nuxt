import VChart from "./VChart.js";
import { defineComponent, h, ref, toRef } from "vue";
const METHOD_NAMES = [
  "setOption",
  "getWidth",
  "getHeight",
  "getDom",
  "getOption",
  "resize",
  "dispatchAction",
  "convertToPixel",
  "convertFromPixel",
  "containPixel",
  "getDataURL",
  "getConnectedDataURL",
  "appendData",
  "clear",
  "isDisposed",
  "dispose"
];
export default defineComponent({
  inheritAttrs: false,
  setup(props, { attrs, slots, expose }) {
    const root = ref(null);
    const publicMethods = Object.fromEntries(
      METHOD_NAMES.map((name) => [
        name,
        (...args) => (root.value?.[name])(...args)
      ])
    );
    expose({
      ...publicMethods,
      root: toRef(() => root.value?.root),
      chart: toRef(() => root.value?.chart)
    });
    return () => h(VChart, { ...attrs, ref: root }, slots);
  }
});

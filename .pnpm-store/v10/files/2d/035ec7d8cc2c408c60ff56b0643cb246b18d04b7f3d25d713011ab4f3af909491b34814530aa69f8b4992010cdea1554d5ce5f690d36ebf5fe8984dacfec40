import * as _nuxt_schema from '@nuxt/schema';
import * as echartsComponents from 'echarts/components';
import * as echartsCharts from 'echarts/charts';
import * as echartsFeatures from 'echarts/features';

type ComponentName = keyof typeof echartsComponents;
type ChartName = keyof typeof echartsCharts;
type FeaturesName = keyof typeof echartsFeatures;
type RendererName = 'canvas' | 'svg';
interface ModuleOptions {
    /**
     * Register the renderer used by `<VChart>`
     * @default 'canvas'
     */
    renderer?: RendererName | RendererName[];
    /**
     * Register the charts used by `<VChart>`
     * (imported only if `<VChart>` is used)
     */
    charts?: ChartName[];
    /**
     * Register the components used by `<VChart>`
     * (imported only if `<VChart>` is used)
     */
    components?: ComponentName[];
    /**
     * Register the features used by `<VChart>`
     * (imported only if `<VChart>` is used)
     */
    features?: FeaturesName[];
}

declare const _default: _nuxt_schema.NuxtModule<ModuleOptions, ModuleOptions, false>;

export { _default as default };

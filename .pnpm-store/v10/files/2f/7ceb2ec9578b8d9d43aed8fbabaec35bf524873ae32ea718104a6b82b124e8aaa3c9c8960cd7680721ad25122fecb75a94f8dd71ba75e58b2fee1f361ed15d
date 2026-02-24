import { type ECSSRClientEventParams, type ECSSREvent } from 'echarts/ssr/client/index';
import type { InitOptions, Option, Theme } from '../types.js';
import { nextTick, type PropType } from 'vue';
type ECSSRHandler = (params: ECSSRClientEventParams) => string | undefined;
declare const __VLS_export: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    option: PropType<Option>;
    theme: {
        type: PropType<Theme>;
    };
    initOptions: PropType<InitOptions>;
}>, {
    root: import("vue").Ref<({
        $: import("vue").ComponentInternalInstance;
        $data: {};
        $props: {
            readonly option?: Option | undefined;
            readonly theme?: Theme | undefined;
            readonly initOptions?: InitOptions | undefined;
            readonly onError?: ((error: unknown) => any) | undefined;
        } & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps;
        $attrs: {
            [x: string]: unknown;
        };
        $refs: {
            [x: string]: unknown;
        };
        $slots: Readonly<{
            [name: string]: import("vue").Slot<any> | undefined;
        }>;
        $root: import("vue").ComponentPublicInstance | null;
        $parent: import("vue").ComponentPublicInstance | null;
        $host: Element | null;
        $emit: (event: "error", error: unknown) => void;
        $el: any;
        $options: import("vue").ComponentOptionsBase<Readonly<{
            option?: Option;
            theme?: Theme;
            initOptions?: InitOptions;
        }> & Readonly<{
            onError?: ((error: unknown) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            error: (error: unknown) => any;
        }, string, {}, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & {
            beforeCreate?: (() => void) | (() => void)[];
            created?: (() => void) | (() => void)[];
            beforeMount?: (() => void) | (() => void)[];
            mounted?: (() => void) | (() => void)[];
            beforeUpdate?: (() => void) | (() => void)[];
            updated?: (() => void) | (() => void)[];
            activated?: (() => void) | (() => void)[];
            deactivated?: (() => void) | (() => void)[];
            beforeDestroy?: (() => void) | (() => void)[];
            beforeUnmount?: (() => void) | (() => void)[];
            destroyed?: (() => void) | (() => void)[];
            unmounted?: (() => void) | (() => void)[];
            renderTracked?: ((e: import("vue").DebuggerEvent) => void) | ((e: import("vue").DebuggerEvent) => void)[];
            renderTriggered?: ((e: import("vue").DebuggerEvent) => void) | ((e: import("vue").DebuggerEvent) => void)[];
            errorCaptured?: ((err: unknown, instance: import("vue").ComponentPublicInstance | null, info: string) => boolean | void) | ((err: unknown, instance: import("vue").ComponentPublicInstance | null, info: string) => boolean | void)[];
        };
        $forceUpdate: () => void;
        $nextTick: typeof nextTick;
        $watch<T extends string | ((...args: any) => any)>(source: T, cb: T extends (...args: any) => infer R ? (...args: [R, R, import("@vue/reactivity").OnCleanup]) => any : (...args: [any, any, import("@vue/reactivity").OnCleanup]) => any, options?: import("vue").WatchOptions): import("vue").WatchStopHandle;
    } & Readonly<{}> & Omit<Readonly<{
        option?: Option;
        theme?: Theme;
        initOptions?: InitOptions;
    }> & Readonly<{
        onError?: ((error: unknown) => any) | undefined;
    }>, never> & import("vue").ShallowUnwrapRef<{}> & {} & import("vue").ComponentCustomProperties & {} & {
        $slots: {
            fallback?: (props: {}) => any;
        };
    }) | null, ({
        $: import("vue").ComponentInternalInstance;
        $data: {};
        $props: {
            readonly option?: Option | undefined;
            readonly theme?: Theme | undefined;
            readonly initOptions?: InitOptions | undefined;
            readonly onError?: ((error: unknown) => any) | undefined;
        } & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps;
        $attrs: {
            [x: string]: unknown;
        };
        $refs: {
            [x: string]: unknown;
        };
        $slots: Readonly<{
            [name: string]: import("vue").Slot<any> | undefined;
        }>;
        $root: import("vue").ComponentPublicInstance | null;
        $parent: import("vue").ComponentPublicInstance | null;
        $host: Element | null;
        $emit: (event: "error", error: unknown) => void;
        $el: any;
        $options: import("vue").ComponentOptionsBase<Readonly<{
            option?: Option;
            theme?: Theme;
            initOptions?: InitOptions;
        }> & Readonly<{
            onError?: ((error: unknown) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            error: (error: unknown) => any;
        }, string, {}, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & {
            beforeCreate?: (() => void) | (() => void)[];
            created?: (() => void) | (() => void)[];
            beforeMount?: (() => void) | (() => void)[];
            mounted?: (() => void) | (() => void)[];
            beforeUpdate?: (() => void) | (() => void)[];
            updated?: (() => void) | (() => void)[];
            activated?: (() => void) | (() => void)[];
            deactivated?: (() => void) | (() => void)[];
            beforeDestroy?: (() => void) | (() => void)[];
            beforeUnmount?: (() => void) | (() => void)[];
            destroyed?: (() => void) | (() => void)[];
            unmounted?: (() => void) | (() => void)[];
            renderTracked?: ((e: import("vue").DebuggerEvent) => void) | ((e: import("vue").DebuggerEvent) => void)[];
            renderTriggered?: ((e: import("vue").DebuggerEvent) => void) | ((e: import("vue").DebuggerEvent) => void)[];
            errorCaptured?: ((err: unknown, instance: import("vue").ComponentPublicInstance | null, info: string) => boolean | void) | ((err: unknown, instance: import("vue").ComponentPublicInstance | null, info: string) => boolean | void)[];
        };
        $forceUpdate: () => void;
        $nextTick: typeof nextTick;
        $watch<T extends string | ((...args: any) => any)>(source: T, cb: T extends (...args: any) => infer R ? (...args: [R, R, import("@vue/reactivity").OnCleanup]) => any : (...args: [any, any, import("@vue/reactivity").OnCleanup]) => any, options?: import("vue").WatchOptions): import("vue").WatchStopHandle;
    } & Readonly<{}> & Omit<Readonly<{
        option?: Option;
        theme?: Theme;
        initOptions?: InitOptions;
    }> & Readonly<{
        onError?: ((error: unknown) => any) | undefined;
    }>, never> & import("vue").ShallowUnwrapRef<{}> & {} & import("vue").ComponentCustomProperties & {} & {
        $slots: {
            fallback?: (props: {}) => any;
        };
    }) | null>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<ECSSREvent, ECSSRHandler>, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    option: PropType<Option>;
    theme: {
        type: PropType<Theme>;
    };
    initOptions: PropType<InitOptions>;
}>> & Readonly<{
    onClick?: ((params: ECSSRClientEventParams) => any) | undefined;
    onMouseout?: ((params: ECSSRClientEventParams) => any) | undefined;
    onMouseover?: ((params: ECSSRClientEventParams) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;

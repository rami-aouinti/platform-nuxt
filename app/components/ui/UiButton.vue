<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string
    rounded?: boolean | 'sm' | 'md' | 'lg' | 'xl' | 'pill' | string
    elevation?: number
    color?: string
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    variant?: string
    disabled?: boolean
    loading?: boolean
    icon?: boolean | string
    to?: RouteLocationRaw
    href?: string
  }>(),
  {
    size: 'md',
    rounded: 'md',
    elevation: 0,
    color: undefined,
    shadow: 'none',
    variant: 'elevated',
    disabled: false,
    loading: false,
    icon: false,
    to: undefined,
    href: undefined,
  },
)

defineOptions({
  inheritAttrs: false,
})

const sizeMap: Record<string, string> = {
  xs: 'x-small',
  sm: 'small',
  md: 'default',
  lg: 'large',
  xl: 'x-large',
}

const roundedMap: Record<string, string | boolean> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  pill: 'pill',
}

const normalizedSize = computed(() => sizeMap[props.size] ?? props.size)
const normalizedRounded = computed(() => {
  if (typeof props.rounded === 'boolean') return props.rounded
  return roundedMap[props.rounded] ?? props.rounded
})
const shadowClass = computed(() => `ui-shadow-${props.shadow}`)
</script>

<template>
  <v-btn
    v-bind="$attrs"
    :class="shadowClass"
    :size="normalizedSize"
    :rounded="normalizedRounded"
    :elevation="elevation"
    :color="color"
    :variant="variant"
    :disabled="disabled"
    :loading="loading"
    :icon="icon"
    :to="to"
    :href="href"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps || {}" />
    </template>
  </v-btn>
</template>

<style scoped>
.ui-shadow-none {
  box-shadow: none !important;
}

.ui-shadow-sm {
  box-shadow: 0 1px 3px rgb(0 0 0 / 14%) !important;
}

.ui-shadow-md {
  box-shadow: 0 4px 10px rgb(0 0 0 / 18%) !important;
}

.ui-shadow-lg {
  box-shadow: 0 8px 20px rgb(0 0 0 / 20%) !important;
}

.ui-shadow-xl {
  box-shadow: 0 12px 30px rgb(0 0 0 / 24%) !important;
}
</style>

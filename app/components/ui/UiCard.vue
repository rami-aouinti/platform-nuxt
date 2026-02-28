<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string
    rounded?: boolean | 'sm' | 'md' | 'lg' | 'xl' | 'pill' | string
    elevation?: number
    color?: string
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    variant?: string
    border?: boolean | string | number
  }>(),
  {
    size: 'md',
    rounded: 'lg',
    elevation: 0,
    color: undefined,
    shadow: 'sm',
    variant: 'elevated',
    border: false,
  },
)

defineOptions({
  inheritAttrs: false,
})

const roundedMap: Record<string, string | boolean> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  pill: 'pill',
}

const sizeClass = computed(() =>
  props.size === 'md' ? undefined : `ui-card--${props.size}`,
)
const normalizedRounded = computed(() => {
  if (typeof props.rounded === 'boolean') return props.rounded
  return roundedMap[props.rounded] ?? props.rounded
})
const shadowClass = computed(() => `ui-shadow-${props.shadow}`)
</script>

<template>
  <v-card
    v-bind="$attrs"
    :class="[sizeClass, shadowClass]"
    :rounded="normalizedRounded"
    :elevation="elevation"
    :color="color"
    :variant="variant"
    :border="border"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps || {}" />
    </template>
  </v-card>
</template>

<style scoped>
.ui-card--xs {
  font-size: 0.75rem;
}

.ui-card--sm {
  font-size: 0.875rem;
}

.ui-card--lg {
  font-size: 1.125rem;
}

.ui-card--xl {
  font-size: 1.25rem;
}

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

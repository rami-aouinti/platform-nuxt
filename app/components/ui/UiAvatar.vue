<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string | number
    rounded?: boolean | 'sm' | 'md' | 'lg' | 'xl' | 'pill' | string
    elevation?: number
    color?: string
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    icon?: string
    image?: string
  }>(),
  {
    size: 'md',
    rounded: true,
    elevation: 0,
    color: undefined,
    shadow: 'none',
    icon: undefined,
    image: undefined,
  },
)

defineOptions({
  inheritAttrs: false,
})

const sizeMap: Record<string, string | number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
}

const roundedMap: Record<string, string | boolean> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  pill: 'pill',
}

const normalizedSize = computed(() =>
  typeof props.size === 'number'
    ? props.size
    : (sizeMap[props.size] ?? props.size),
)
const normalizedRounded = computed(() => {
  if (typeof props.rounded === 'boolean') return props.rounded
  return roundedMap[props.rounded] ?? props.rounded
})
const shadowClass = computed(() => `ui-shadow-${props.shadow}`)
</script>

<template>
  <v-avatar
    v-bind="$attrs"
    :class="shadowClass"
    :size="normalizedSize"
    :rounded="normalizedRounded"
    :elevation="elevation"
    :color="color"
    :image="image"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps || {}" />
    </template>

    <v-icon v-if="icon && !$slots.default" :icon="icon" />
  </v-avatar>
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

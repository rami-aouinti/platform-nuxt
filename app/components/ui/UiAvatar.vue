<script setup lang="ts">
import { resolveRoundedClass, resolveShadowClass } from '~/utils/ui-style-mappers'
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

const normalizedSize = computed(() =>
  typeof props.size === 'number'
    ? props.size
    : (sizeMap[props.size] ?? props.size),
)
const normalizedRounded = computed(() =>
  typeof props.rounded === 'boolean' ? props.rounded : undefined,
)
const roundedClass = computed(() => resolveRoundedClass(props.rounded))
const shadowClass = computed(() => resolveShadowClass(props.shadow))
</script>

<template>
  <v-avatar
    v-bind="$attrs"
    :class="[shadowClass, roundedClass]"
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



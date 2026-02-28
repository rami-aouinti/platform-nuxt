<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import { resolveRoundedClass, resolveShadowClass } from '~/utils/ui-style-mappers'

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

const normalizedSize = computed(() => sizeMap[props.size] ?? props.size)
const normalizedRounded = computed(() =>
  typeof props.rounded === 'boolean' ? props.rounded : undefined,
)
const roundedClass = computed(() => resolveRoundedClass(props.rounded))
const shadowClass = computed(() => resolveShadowClass(props.shadow))
</script>

<template>
  <v-btn
    v-bind="$attrs"
    :class="[shadowClass, roundedClass]"
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

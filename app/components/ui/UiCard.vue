<script setup lang="ts">
import { resolveRoundedClass, resolveShadowClass } from '~/utils/ui-style-mappers'
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

const sizeClass = computed(() =>
  props.size === 'md' ? undefined : `ui-card--${props.size}`,
)
const normalizedRounded = computed(() =>
  typeof props.rounded === 'boolean' ? props.rounded : undefined,
)
const roundedClass = computed(() => resolveRoundedClass(props.rounded))
const shadowClass = computed(() => resolveShadowClass(props.shadow))
</script>

<template>
  <v-card
    v-bind="$attrs"
    :class="[sizeClass, shadowClass, roundedClass]"
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

</style>

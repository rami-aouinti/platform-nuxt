<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: undefined,
    description: undefined,
  },
)
</script>

<template>
  <div
    class="admin-toolbar d-flex flex-wrap align-center justify-space-between ga-4"
  >
    <div>
      <h1 v-if="title" class="admin-toolbar__title admin-heading">
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="admin-toolbar__description text-medium-emphasis mb-0"
      >
        {{ description }}
      </p>
    </div>

    <div v-if="$slots.actions" class="d-flex flex-wrap ga-2">
      <slot name="actions" />
    </div>
  </div>
</template>

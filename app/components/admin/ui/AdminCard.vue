<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    elevation?: number
  }>(),
  {
    title: undefined,
    subtitle: undefined,
    elevation: 2,
  },
)
</script>

<template>
  <v-card class="admin-card" :elevation="elevation" rounded="xl">
    <v-card-item v-if="title || subtitle" class="admin-card__header">
      <v-card-title v-if="title" class="admin-heading">{{
        title
      }}</v-card-title>
      <v-card-subtitle v-if="subtitle">{{ subtitle }}</v-card-subtitle>
      <template v-if="$slots.headerActions" #append>
        <slot name="headerActions" />
      </template>
    </v-card-item>

    <v-divider v-if="title || subtitle || $slots.headerActions" />

    <v-card-text class="admin-card__content">
      <slot />
    </v-card-text>

    <v-divider v-if="$slots.actions" />

    <v-card-actions v-if="$slots.actions" class="admin-card__actions">
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { UpdateResumePayload } from '~/composables/useResumeApi'

const props = defineProps<{
  modelValue: UpdateResumePayload
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: UpdateResumePayload]
}>()

const form = computed({
  get: () => props.modelValue,
  set: (value: UpdateResumePayload) => emit('update:modelValue', value),
})
</script>

<template>
  <v-row>
    <v-col cols="12" md="6">
      <v-text-field
        v-model="form.title"
        :disabled="disabled"
        label="Titre du CV"
        required
      />
    </v-col>

    <v-col cols="12" md="6">
      <v-text-field
        v-model="form.headline"
        :disabled="disabled"
        label="Accroche"
      />
    </v-col>

    <v-col cols="12" md="6">
      <v-text-field
        v-model="form.location"
        :disabled="disabled"
        label="Localisation"
      />
    </v-col>

    <v-col cols="12">
      <v-textarea
        v-model="form.summary"
        :disabled="disabled"
        label="Résumé"
        rows="4"
      />
    </v-col>
  </v-row>
</template>

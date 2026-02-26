<script setup lang="ts">
import { ResumeEducationLevel, type UpdateResumeEducationPayload } from '~/composables/useResumeApi'

const props = defineProps<{
  modelValue: UpdateResumeEducationPayload
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: UpdateResumeEducationPayload]
}>()

const form = computed({
  get: () => props.modelValue,
  set: (value: UpdateResumeEducationPayload) => emit('update:modelValue', value),
})

const levelItems = Object.values(ResumeEducationLevel)
</script>

<template>
  <v-row>
    <v-col cols="12" md="6"><v-text-field v-model="form.institution" :disabled="disabled" label="Établissement" /></v-col>
    <v-col cols="12" md="6"><v-text-field v-model="form.degree" :disabled="disabled" label="Diplôme" /></v-col>
    <v-col cols="12" md="6"><v-text-field v-model="form.fieldOfStudy" :disabled="disabled" label="Domaine d'étude" /></v-col>
    <v-col cols="12" md="6"><v-select v-model="form.level" :disabled="disabled" :items="levelItems" label="Niveau" /></v-col>
    <v-col cols="12" md="4"><v-text-field v-model="form.startDate" :disabled="disabled" label="Date de début" type="date" /></v-col>
    <v-col cols="12" md="4"><v-text-field v-model="form.endDate" :disabled="disabled || form.isCurrent" label="Date de fin" type="date" /></v-col>
    <v-col cols="12" md="4"><v-checkbox v-model="form.isCurrent" :disabled="disabled" label="En cours" /></v-col>
    <v-col cols="12"><v-textarea v-model="form.description" :disabled="disabled" label="Description" rows="3" /></v-col>
  </v-row>
</template>

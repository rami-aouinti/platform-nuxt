<script setup lang="ts">
import { ResumeEmploymentType, type UpdateResumeExperiencePayload } from '~/composables/useResumeApi'

const props = defineProps<{
  modelValue: UpdateResumeExperiencePayload
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: UpdateResumeExperiencePayload]
}>()

const form = computed({
  get: () => props.modelValue,
  set: (value: UpdateResumeExperiencePayload) => emit('update:modelValue', value),
})

const employmentTypeItems = Object.values(ResumeEmploymentType)
</script>

<template>
  <v-row>
    <v-col cols="12" md="6"><v-text-field v-model="form.company" :disabled="disabled" label="Entreprise" /></v-col>
    <v-col cols="12" md="6"><v-text-field v-model="form.role" :disabled="disabled" label="Poste" /></v-col>
    <v-col cols="12" md="4"><v-text-field v-model="form.startDate" :disabled="disabled" label="Date de début" type="date" /></v-col>
    <v-col cols="12" md="4"><v-text-field v-model="form.endDate" :disabled="disabled || form.isCurrent" label="Date de fin" type="date" /></v-col>
    <v-col cols="12" md="4"><v-checkbox v-model="form.isCurrent" :disabled="disabled" label="Poste actuel" /></v-col>
    <v-col cols="12" md="6"><v-select v-model="form.employmentType" :disabled="disabled" :items="employmentTypeItems" label="Type d'emploi" /></v-col>
    <v-col cols="12" md="6"><v-text-field v-model="form.location" :disabled="disabled" label="Localisation" /></v-col>
    <v-col cols="12"><v-textarea v-model="form.description" :disabled="disabled" label="Description" rows="3" /></v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ResumeEducationLevel } from '~/composables/useResumeApi'
import type { ResumeEducationFormModel } from '~/types/resume'

const props = defineProps<{
  modelValue: ResumeEducationFormModel
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ResumeEducationFormModel]
}>()

const form = computed({
  get: () => props.modelValue,
  set: (value: ResumeEducationFormModel) => emit('update:modelValue', value),
})

const levelItems = Object.values(ResumeEducationLevel)

const requiredRule = (label: string) => (value?: string | null) => {
  if (typeof value === 'string' && value.trim().length > 0) return true
  return `${label} est requis.`
}

const levelRule = (value?: ResumeEducationLevel | null) => {
  if (!value) return true
  return levelItems.includes(value) || 'Le niveau est invalide.'
}

const endDateRule = (value?: string | null) => {
  if (form.value.isCurrent) return true
  if (!value || !form.value.startDate) return true
  return value >= form.value.startDate || 'La date de fin doit être postérieure ou égale à la date de début.'
}

watch(() => form.value.isCurrent, (isCurrent) => {
  if (isCurrent) {
    form.value = { ...form.value, endDate: null }
  }
})
</script>

<template>
  <v-row>
    <v-col cols="12" md="6"><v-text-field v-model="form.institution" :disabled="disabled" label="Établissement" :rules="[requiredRule('L\'établissement')]" /></v-col>
    <v-col cols="12" md="6"><v-text-field v-model="form.degree" :disabled="disabled" label="Diplôme" :rules="[requiredRule('Le diplôme')]" /></v-col>
    <v-col cols="12" md="6"><v-text-field v-model="form.fieldOfStudy" :disabled="disabled" label="Domaine d'étude" /></v-col>
    <v-col cols="12" md="6"><v-select v-model="form.level" :disabled="disabled" :items="levelItems" label="Niveau" :rules="[levelRule]" /></v-col>
    <v-col cols="12" md="4"><v-text-field v-model="form.startDate" :disabled="disabled" label="Date de début" type="date" :rules="[requiredRule('La date de début')]" /></v-col>
    <v-col cols="12" md="4"><v-text-field v-model="form.endDate" :disabled="disabled || form.isCurrent" label="Date de fin" type="date" :rules="[endDateRule]" /></v-col>
    <v-col cols="12" md="4"><v-checkbox v-model="form.isCurrent" :disabled="disabled" label="En cours" /></v-col>
    <v-col cols="12"><v-textarea v-model="form.description" :disabled="disabled" label="Description" rows="3" /></v-col>
  </v-row>
</template>

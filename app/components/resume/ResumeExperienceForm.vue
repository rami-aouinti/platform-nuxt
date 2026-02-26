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

const requiredRule = (label: string) => (value?: string | null) => {
  if (typeof value === 'string' && value.trim().length > 0) return true
  return `${label} est requis.`
}

const employmentTypeRule = (value?: ResumeEmploymentType | null) => {
  if (!value) return true
  return employmentTypeItems.includes(value) || "Le type d'emploi est invalide."
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
    <v-col cols="12" md="6"><v-text-field v-model="form.company" :disabled="disabled" label="Entreprise" :rules="[requiredRule('L\'entreprise')]" /></v-col>
    <v-col cols="12" md="6"><v-text-field v-model="form.role" :disabled="disabled" label="Poste" :rules="[requiredRule('Le poste')]" /></v-col>
    <v-col cols="12" md="4"><v-text-field v-model="form.startDate" :disabled="disabled" label="Date de début" type="date" :rules="[requiredRule('La date de début')]" /></v-col>
    <v-col cols="12" md="4"><v-text-field v-model="form.endDate" :disabled="disabled || form.isCurrent" label="Date de fin" type="date" :rules="[endDateRule]" /></v-col>
    <v-col cols="12" md="4"><v-checkbox v-model="form.isCurrent" :disabled="disabled" label="Poste actuel" /></v-col>
    <v-col cols="12" md="6"><v-select v-model="form.employmentType" :disabled="disabled" :items="employmentTypeItems" label="Type d'emploi" :rules="[employmentTypeRule]" /></v-col>
    <v-col cols="12" md="6"><v-text-field v-model="form.location" :disabled="disabled" label="Localisation" /></v-col>
    <v-col cols="12"><v-textarea v-model="form.description" :disabled="disabled" label="Description" rows="3" /></v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ResumeSkillLevel, type UpdateResumeSkillPayload } from '~/composables/useResumeApi'

const props = defineProps<{
  modelValue: UpdateResumeSkillPayload
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: UpdateResumeSkillPayload]
}>()

const form = computed({
  get: () => props.modelValue,
  set: (value: UpdateResumeSkillPayload) => emit('update:modelValue', value),
})

const levelItems = Object.values(ResumeSkillLevel)

const requiredRule = (label: string) => (value?: string | null) => {
  if (typeof value === 'string' && value.trim().length > 0) return true
  return `${label} est requis.`
}

const levelRule = (value?: ResumeSkillLevel | null) => {
  if (!value) return true
  return levelItems.includes(value) || 'Le niveau est invalide.'
}

const yearsOfExperienceRule = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return true
  return Number.isInteger(value) || "Le nombre d'années doit être un entier."
}
</script>

<template>
  <v-row>
    <v-col cols="12" md="5"><v-text-field v-model="form.name" :disabled="disabled" label="Compétence" :rules="[requiredRule('Le nom de la compétence')]" /></v-col>
    <v-col cols="12" md="4"><v-select v-model="form.level" :disabled="disabled" :items="levelItems" label="Niveau" :rules="[levelRule]" /></v-col>
    <v-col cols="12" md="3"><v-text-field v-model.number="form.yearsOfExperience" :disabled="disabled" label="Années" type="number" min="0" step="1" :rules="[yearsOfExperienceRule]" /></v-col>
  </v-row>
</template>

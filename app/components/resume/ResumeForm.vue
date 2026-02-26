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

const requiredRule = (label: string) => (value?: string | null) => {
  if (typeof value === 'string' && value.trim().length > 0) return true
  return `${label} est requis.`
}

const lengthRule = (label: string, min: number, max: number) => (value?: string | null) => {
  const trimmedValue = value?.trim() || ''
  if (!trimmedValue) return true
  if (trimmedValue.length < min || trimmedValue.length > max) {
    return `${label} doit contenir entre ${min} et ${max} caractères.`
  }
  return true
}

const titleRules = [requiredRule('Le titre'), lengthRule('Le titre', 2, 255)]
const summaryRules = [requiredRule('Le résumé'), lengthRule('Le résumé', 10, 10_000)]
const isPublicRule = (value?: boolean | null) => {
  if (value === undefined || value === null || typeof value === 'boolean') return true
  return 'La visibilité doit être un booléen.'
}
</script>

<template>
  <v-row>
    <v-col cols="12" md="6">
      <v-text-field
        v-model="form.title"
        :disabled="disabled"
        label="Titre du CV"
        :rules="titleRules"
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

    <v-col cols="12" md="6">
      <v-checkbox
        v-model="form.isPublic"
        :disabled="disabled"
        :rules="[isPublicRule]"
        label="CV public"
      />
    </v-col>

    <v-col cols="12">
      <v-textarea
        v-model="form.summary"
        :disabled="disabled"
        label="Résumé"
        :rules="summaryRules"
        rows="4"
      />
    </v-col>
  </v-row>
</template>

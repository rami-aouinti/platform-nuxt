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
</script>

<template>
  <v-row>
    <v-col cols="12" md="5"><v-text-field v-model="form.name" :disabled="disabled" label="Compétence" /></v-col>
    <v-col cols="12" md="4"><v-select v-model="form.level" :disabled="disabled" :items="levelItems" label="Niveau" /></v-col>
    <v-col cols="12" md="3"><v-text-field v-model.number="form.yearsOfExperience" :disabled="disabled" label="Années" type="number" min="0" /></v-col>
  </v-row>
</template>

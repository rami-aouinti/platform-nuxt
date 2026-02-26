<script setup lang="ts">
import { TaskRequestType } from '~/types/task-manager'

const modelValue = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  submit: [payload: { taskId: string; reason: string; type: TaskRequestType }]
}>()

const form = reactive({
  taskId: '',
  reason: '',
  type: TaskRequestType.OTHER,
})

watch(modelValue, (open) => {
  if (!open) {
    form.taskId = ''
    form.reason = ''
    form.type = TaskRequestType.OTHER
  }
})

function submit() {
  emit('submit', {
    taskId: form.taskId.trim(),
    reason: form.reason.trim(),
    type: form.type,
  })
  modelValue.value = false
}
</script>

<template>
  <v-dialog v-model="modelValue" max-width="640">
    <v-card>
      <v-card-title>Nouvelle demande</v-card-title>
      <v-card-text>
        <v-text-field v-model="form.taskId" label="ID tâche" variant="outlined" class="mb-3" />
        <v-select
          v-model="form.type"
          label="Type"
          variant="outlined"
          class="mb-3"
          :items="[
            { title: 'Accès', value: TaskRequestType.ACCESS },
            { title: 'Extension', value: TaskRequestType.EXTENSION },
            { title: 'Réassignation', value: TaskRequestType.REASSIGNMENT },
            { title: 'Autre', value: TaskRequestType.OTHER },
          ]"
        />
        <v-textarea v-model="form.reason" label="Raison" variant="outlined" rows="3" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="modelValue = false">Annuler</v-btn>
        <v-btn color="primary" :disabled="!form.taskId.trim() || !form.reason.trim()" @click="submit">Envoyer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

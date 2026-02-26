<script setup lang="ts">
import { ProjectStatus, type Project } from '~/types/task-manager'

const modelValue = defineModel<boolean>({ default: false })

const props = defineProps<{
  project?: Project | null
}>()

const emit = defineEmits<{
  save: [payload: { id?: string; name: string; description: string; status: ProjectStatus }]
}>()

const form = reactive({
  name: '',
  description: '',
  status: ProjectStatus.DRAFT,
})

const isEdit = computed(() => Boolean(props.project))

watch(
  () => props.project,
  (value) => {
    form.name = value?.name ?? ''
    form.description = value?.description ?? ''
    form.status = value?.status ?? ProjectStatus.DRAFT
  },
  { immediate: true },
)

function save() {
  emit('save', {
    id: props.project?.id ? String(props.project.id) : undefined,
    name: form.name.trim(),
    description: form.description.trim(),
    status: form.status,
  })
  modelValue.value = false
}
</script>

<template>
  <v-dialog v-model="modelValue" max-width="640">
    <v-card>
      <v-card-title>{{ isEdit ? 'Modifier le projet' : 'Créer un projet' }}</v-card-title>
      <v-card-text>
        <v-text-field v-model="form.name" label="Nom" variant="outlined" class="mb-3" />
        <v-textarea v-model="form.description" label="Description" variant="outlined" rows="3" class="mb-3" />
        <v-select
          v-model="form.status"
          label="Statut"
          variant="outlined"
          :items="[
            { title: 'Brouillon', value: ProjectStatus.DRAFT },
            { title: 'Actif', value: ProjectStatus.ACTIVE },
            { title: 'Terminé', value: ProjectStatus.COMPLETED },
            { title: 'Archivé', value: ProjectStatus.ARCHIVED },
          ]"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="modelValue = false">Annuler</v-btn>
        <v-btn color="primary" :disabled="!form.name.trim()" @click="save">Enregistrer</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

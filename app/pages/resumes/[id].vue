<script setup lang="ts">
import { useResumeStore } from '~/stores/resume'
import { notifyFormValidationError } from '~/stores/_factories/storeNotifications'
import type { ResumeEducation, ResumeExperience, ResumeSkill } from '~/composables/useResumeApi'
import type {
  ResumeEducationFormModel,
  ResumeExperienceFormModel,
  ResumeFormModel,
  ResumeSkillFormModel,
} from '~/types/resume'

definePageMeta({
  title: 'Détail CV',
  icon: 'mdi-file-document-edit-outline',
  requiresAuth: true,
  middleware: ['auth'],
  alias: ['/profile/resumes/:id'],
})

const route = useRoute()
const router = useRouter()
const resumeStore = useResumeStore()

const resumeId = computed(() => {
  const params = route.params as Record<string, string | string[] | undefined>
  const id = params.id
  return Array.isArray(id) ? String(id[0] || '') : String(id || '')
})

const loading = computed(() => resumeStore.loadingByAction.fetchResumeAggregate || false)
const busy = resumeStore.isBusy

const resumeFormRef = ref()
const experienceFormRef = ref()
const educationFormRef = ref()
const skillFormRef = ref()

const isResumeFormValid = ref(false)
const isExperienceFormValid = ref(false)
const isEducationFormValid = ref(false)
const isSkillFormValid = ref(false)

const resumeForm = ref<ResumeFormModel>(resumeStore.mapResumeApiToFormModel())
const experienceForm = ref<ResumeExperienceFormModel>(resumeStore.mapResumeExperienceApiToFormModel(null, ''))
const educationForm = ref<ResumeEducationFormModel>(resumeStore.mapResumeEducationApiToFormModel(null, ''))
const skillForm = ref<ResumeSkillFormModel>(resumeStore.mapResumeSkillApiToFormModel(null, ''))

const editingExperienceId = ref<string | null>(null)
const editingEducationId = ref<string | null>(null)
const editingSkillId = ref<string | null>(null)

const experiences = resumeStore.currentResumeExperiences
const educationList = resumeStore.currentResumeEducations
const skills = resumeStore.currentResumeSkills

async function loadData() {
  await resumeStore.fetchResumeAggregate(resumeId.value)

  const currentResume = resumeStore.currentResume
  if (!currentResume) return

  resumeForm.value = resumeStore.mapResumeApiToFormModel(currentResume)

  resetExperienceForm()
  resetEducationForm()
  resetSkillForm()
}

function resetExperienceForm() {
  editingExperienceId.value = null
  experienceForm.value = resumeStore.mapResumeExperienceApiToFormModel(null, resumeId.value)
}

function resetEducationForm() {
  editingEducationId.value = null
  educationForm.value = resumeStore.mapResumeEducationApiToFormModel(null, resumeId.value)
}

function resetSkillForm() {
  editingSkillId.value = null
  skillForm.value = resumeStore.mapResumeSkillApiToFormModel(null, resumeId.value)
}

async function validateForm(formRef: { validate?: () => Promise<{ valid: boolean }> }) {
  const validationResult = await formRef?.validate?.()
  return Boolean(validationResult?.valid)
}

async function saveResume() {
  if (!await validateForm(resumeFormRef.value)) {
    notifyFormValidationError('Les informations du CV')
    return
  }

  await resumeStore.updateResumeFromForm(resumeId.value, resumeForm.value)
  await loadData()
}

async function patchResumeData() {
  const previous = resumeStore.mapResumeApiToFormModel(resumeStore.currentResume)
  await resumeStore.patchResumeFromForm(resumeId.value, resumeForm.value, previous)
  await loadData()
}

async function removeResume() {
  await resumeStore.deleteResume(resumeId.value)
  await router.push('/profile/resumes')
}

function editExperience(item: ResumeExperience) {
  editingExperienceId.value = item.id
  experienceForm.value = resumeStore.mapResumeExperienceApiToFormModel(item, resumeId.value)
}

async function submitExperience() {
  if (!await validateForm(experienceFormRef.value)) {
    notifyFormValidationError("L'expérience")
    return
  }

  const payload = { ...experienceForm.value, resume: resumeId.value }
  if (editingExperienceId.value) {
    await resumeStore.updateExperienceFromForm(editingExperienceId.value, payload)
  } else {
    await resumeStore.createExperienceFromForm(payload)
  }
  await loadData()
}

async function patchSelectedExperience() {
  if (!editingExperienceId.value) return
  const previous = experiences.value.find((item: ResumeExperience) => item.id === editingExperienceId.value)
  await resumeStore.patchExperienceFromForm(editingExperienceId.value, experienceForm.value, resumeStore.mapResumeExperienceApiToFormModel(previous, resumeId.value))
  await loadData()
}

async function removeExperience(id: string) {
  await resumeStore.deleteExperience(id, resumeId.value)
  await loadData()
}

function editEducation(item: ResumeEducation) {
  editingEducationId.value = item.id
  educationForm.value = resumeStore.mapResumeEducationApiToFormModel(item, resumeId.value)
}

async function submitEducation() {
  if (!await validateForm(educationFormRef.value)) {
    notifyFormValidationError('La formation')
    return
  }

  const payload = { ...educationForm.value, resume: resumeId.value }
  if (editingEducationId.value) {
    await resumeStore.updateEducationFromForm(editingEducationId.value, payload)
  } else {
    await resumeStore.createEducationFromForm(payload)
  }
  await loadData()
}

async function patchSelectedEducation() {
  if (!editingEducationId.value) return
  const previous = educationList.value.find((item: ResumeEducation) => item.id === editingEducationId.value)
  await resumeStore.patchEducationFromForm(editingEducationId.value, educationForm.value, resumeStore.mapResumeEducationApiToFormModel(previous, resumeId.value))
  await loadData()
}

async function removeEducation(id: string) {
  await resumeStore.deleteEducation(id, resumeId.value)
  await loadData()
}

function editSkill(item: ResumeSkill) {
  editingSkillId.value = item.id
  skillForm.value = resumeStore.mapResumeSkillApiToFormModel(item, resumeId.value)
}

async function submitSkill() {
  if (!await validateForm(skillFormRef.value)) {
    notifyFormValidationError('La compétence')
    return
  }

  const payload = { ...skillForm.value, resume: resumeId.value }
  if (editingSkillId.value) {
    await resumeStore.updateSkillFromForm(editingSkillId.value, payload)
  } else {
    await resumeStore.createSkillFromForm(payload)
  }
  await loadData()
}

async function patchSelectedSkill() {
  if (!editingSkillId.value) return
  const previous = skills.value.find((item: ResumeSkill) => item.id === editingSkillId.value)
  await resumeStore.patchSkillFromForm(editingSkillId.value, skillForm.value, resumeStore.mapResumeSkillApiToFormModel(previous, resumeId.value))
  await loadData()
}

async function removeSkill(id: string) {
  await resumeStore.deleteSkill(id, resumeId.value)
  await loadData()
}

onMounted(loadData)
</script>

<template>
  <v-container class="py-6">
    <div class="d-flex justify-space-between align-center mb-4 ga-2 flex-wrap">
      <h1 class="text-h5">{{ resumeStore.currentResume?.title || 'CV' }}</h1>
      <div class="d-flex ga-2">
        <v-btn variant="text" to="/profile/resumes">Retour</v-btn>
        <v-btn color="error" :loading="busy" :disabled="loading || busy" @click="removeResume">Supprimer le CV</v-btn>
      </div>
    </div>

    <v-progress-linear v-if="loading" indeterminate class="mb-4" />

    <v-expansion-panels multiple>
      <v-expansion-panel title="Informations du CV">
        <v-expansion-panel-text>
          <v-form ref="resumeFormRef" v-model="isResumeFormValid">
            <ResumeForm v-model="resumeForm" :disabled="loading || busy" />
          </v-form>
          <div class="d-flex justify-end ga-2">
            <v-btn color="primary" :loading="busy" :disabled="loading || busy || !isResumeFormValid" @click="saveResume">Mettre à jour (PUT)</v-btn>
            <v-btn variant="outlined" :loading="busy" :disabled="loading || busy || !isResumeFormValid" @click="patchResumeData">Patch (PATCH)</v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel :title="`Expériences (${resumeStore.experienceCount})`">
        <v-expansion-panel-text>
          <v-form ref="experienceFormRef" v-model="isExperienceFormValid">
            <ResumeExperienceForm v-model="experienceForm" :disabled="loading || busy" />
          </v-form>
          <div class="d-flex justify-end ga-2 mb-4">
            <v-btn variant="text" :disabled="loading || busy" @click="resetExperienceForm">Annuler</v-btn>
            <v-btn color="primary" :loading="busy" :disabled="loading || busy || !isExperienceFormValid" @click="submitExperience">{{ editingExperienceId ? 'Mettre à jour (PUT)' : 'Ajouter' }}</v-btn>
            <v-btn v-if="editingExperienceId" variant="outlined" :loading="busy" :disabled="loading || busy || !isExperienceFormValid" @click="patchSelectedExperience">Patch</v-btn>
          </div>
          <v-list lines="two">
            <v-list-item v-for="item in experiences" :key="item.id" :title="`${item.role} · ${item.company}`" :subtitle="item.startDate">
              <template #append>
                <v-btn icon="mdi-pencil" variant="text" :disabled="loading || busy" @click="editExperience(item)" />
                <v-btn icon="mdi-delete" color="error" variant="text" :disabled="loading || busy" @click="removeExperience(item.id)" />
              </template>
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel :title="`Formations (${resumeStore.educationCount})`">
        <v-expansion-panel-text>
          <v-form ref="educationFormRef" v-model="isEducationFormValid">
            <ResumeEducationForm v-model="educationForm" :disabled="loading || busy" />
          </v-form>
          <div class="d-flex justify-end ga-2 mb-4">
            <v-btn variant="text" :disabled="loading || busy" @click="resetEducationForm">Annuler</v-btn>
            <v-btn color="primary" :loading="busy" :disabled="loading || busy || !isEducationFormValid" @click="submitEducation">{{ editingEducationId ? 'Mettre à jour (PUT)' : 'Ajouter' }}</v-btn>
            <v-btn v-if="editingEducationId" variant="outlined" :loading="busy" :disabled="loading || busy || !isEducationFormValid" @click="patchSelectedEducation">Patch</v-btn>
          </div>
          <v-list lines="two">
            <v-list-item v-for="item in educationList" :key="item.id" :title="item.institution" :subtitle="item.degree || '-'">
              <template #append>
                <v-btn icon="mdi-pencil" variant="text" :disabled="loading || busy" @click="editEducation(item)" />
                <v-btn icon="mdi-delete" color="error" variant="text" :disabled="loading || busy" @click="removeEducation(item.id)" />
              </template>
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel :title="`Compétences (${resumeStore.skillCount})`">
        <v-expansion-panel-text>
          <v-form ref="skillFormRef" v-model="isSkillFormValid">
            <ResumeSkillForm v-model="skillForm" :disabled="loading || busy" />
          </v-form>
          <div class="d-flex justify-end ga-2 mb-4">
            <v-btn variant="text" :disabled="loading || busy" @click="resetSkillForm">Annuler</v-btn>
            <v-btn color="primary" :loading="busy" :disabled="loading || busy || !isSkillFormValid" @click="submitSkill">{{ editingSkillId ? 'Mettre à jour (PUT)' : 'Ajouter' }}</v-btn>
            <v-btn v-if="editingSkillId" variant="outlined" :loading="busy" :disabled="loading || busy || !isSkillFormValid" @click="patchSelectedSkill">Patch</v-btn>
          </div>
          <v-list lines="two">
            <v-list-item v-for="item in skills" :key="item.id" :title="item.name" :subtitle="item.level || '-'">
              <template #append>
                <v-btn icon="mdi-pencil" variant="text" :disabled="loading || busy" @click="editSkill(item)" />
                <v-btn icon="mdi-delete" color="error" variant="text" :disabled="loading || busy" @click="removeSkill(item.id)" />
              </template>
            </v-list-item>
          </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

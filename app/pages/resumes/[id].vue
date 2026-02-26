<script setup lang="ts">
import { Notify } from '~/stores/notification'
import type {
  Resume,
  ResumeEducation,
  ResumeExperience,
  ResumeSkill,
  UpdateResumeEducationPayload,
  UpdateResumeExperiencePayload,
  UpdateResumePayload,
  UpdateResumeSkillPayload,
} from '~/composables/useResumeApi'

definePageMeta({
  title: 'Détail CV',
  icon: 'mdi-file-document-edit-outline',
  requiresAuth: true,
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const resumeId = computed(() => {
  const params = route.params as Record<string, string | string[] | undefined>
  const id = params.id
  return Array.isArray(id) ? String(id[0] || '') : String(id || '')
})

const {
  getResume,
  updateResume,
  patchResume,
  deleteResume,
  getResumeExperiences,
  createResumeExperience,
  updateResumeExperience,
  patchResumeExperience,
  deleteResumeExperience,
  getResumeEducationList,
  createResumeEducation,
  updateResumeEducation,
  patchResumeEducation,
  deleteResumeEducation,
  getResumeSkills,
  createResumeSkill,
  updateResumeSkill,
  patchResumeSkill,
  deleteResumeSkill,
} = useResumeApi()

const loading = ref(false)
const busy = ref(false)
const resumeFormRef = ref()
const experienceFormRef = ref()
const educationFormRef = ref()
const skillFormRef = ref()
const isResumeFormValid = ref(false)
const isExperienceFormValid = ref(false)
const isEducationFormValid = ref(false)
const isSkillFormValid = ref(false)
const resume = ref<Resume | null>(null)
const resumeForm = ref<UpdateResumePayload>({ title: '', headline: '', summary: '', location: '', isPublic: false })

const experiences = ref<ResumeExperience[]>([])
const experienceForm = ref<UpdateResumeExperiencePayload>({ resume: '', company: '', role: '', startDate: '' })
const editingExperienceId = ref<string | null>(null)

const educationList = ref<ResumeEducation[]>([])
const educationForm = ref<UpdateResumeEducationPayload>({ resume: '', institution: '' })
const editingEducationId = ref<string | null>(null)

const skills = ref<ResumeSkill[]>([])
const skillForm = ref<UpdateResumeSkillPayload>({ resume: '', name: '' })
const editingSkillId = ref<string | null>(null)

async function loadData() {
  loading.value = true
  try {
    const [resumeResponse, experiencesResponse, educationResponse, skillsResponse] = await Promise.all([
      getResume(resumeId.value),
      getResumeExperiences({ where: { resume: resumeId.value }, limit: 100 }),
      getResumeEducationList({ where: { resume: resumeId.value }, limit: 100 }),
      getResumeSkills({ where: { resume: resumeId.value }, limit: 100 }),
    ])

    resume.value = resumeResponse
    resumeForm.value = {
      title: resumeResponse.title || '',
      headline: resumeResponse.headline || '',
      summary: resumeResponse.summary || '',
      location: resumeResponse.location || '',
      isPublic: Boolean(resumeResponse.isPublic),
    }
    experiences.value = experiencesResponse.data || []
    educationList.value = educationResponse.data || []
    skills.value = skillsResponse.data || []

    resetExperienceForm()
    resetEducationForm()
    resetSkillForm()
  } catch (errorValue) {
    const message = errorValue instanceof Error ? errorValue.message : 'Chargement du CV impossible.'
    Notify.error(`Chargement du CV impossible. ${message}`)
  } finally {
    loading.value = false
  }
}

function resetExperienceForm() {
  editingExperienceId.value = null
  experienceForm.value = { resume: resumeId.value, company: '', role: '', startDate: '' }
}

function resetEducationForm() {
  editingEducationId.value = null
  educationForm.value = { resume: resumeId.value, institution: '' }
}

function resetSkillForm() {
  editingSkillId.value = null
  skillForm.value = { resume: resumeId.value, name: '' }
}

async function validateForm(formRef: { validate?: () => Promise<{ valid: boolean }> }) {
  const validationResult = await formRef?.validate?.()
  return Boolean(validationResult?.valid)
}

async function saveResume() {
  if (!await validateForm(resumeFormRef.value)) {
    Notify.error('Les informations du CV contiennent des erreurs. Merci de les corriger.')
    return
  }

  busy.value = true
  try {
    await updateResume(resumeId.value, resumeForm.value)
    await loadData()
  } catch {
    // Notifications already handled by useResumeApi.
  } finally {
    busy.value = false
  }
}

async function patchResumeData() {
  busy.value = true
  try {
    await patchResume(resumeId.value, {
      headline: resumeForm.value.headline,
      summary: resumeForm.value.summary,
      location: resumeForm.value.location,
    })
    await loadData()
  } catch {
    // Notifications already handled by useResumeApi.
  } finally {
    busy.value = false
  }
}

async function removeResume() {
  busy.value = true
  try {
    await deleteResume(resumeId.value)
    await router.push('/resumes')
  } catch {
    // Notifications already handled by useResumeApi.
  } finally {
    busy.value = false
  }
}

function editExperience(item: ResumeExperience) {
  editingExperienceId.value = item.id
  experienceForm.value = { ...item }
}

async function submitExperience() {
  if (!await validateForm(experienceFormRef.value)) {
    Notify.error("L'expérience contient des erreurs. Merci de les corriger.")
    return
  }

  busy.value = true
  try {
    const payload = { ...experienceForm.value, resume: resumeId.value }
    if (editingExperienceId.value) {
      await updateResumeExperience(editingExperienceId.value, payload)
    } else {
      await createResumeExperience(payload as never)
    }
    await loadData()
  } catch {
    // Notifications already handled by useResumeApi.
  } finally {
    busy.value = false
  }
}

async function patchSelectedExperience() {
  if (!editingExperienceId.value) return
  busy.value = true
  try {
    await patchResumeExperience(editingExperienceId.value, experienceForm.value)
    await loadData()
  } catch {
    // Notifications already handled by useResumeApi.
  } finally {
    busy.value = false
  }
}

async function removeExperience(id: string) {
  busy.value = true
  try {
    await deleteResumeExperience(id)
    await loadData()
  } catch {
    // Notifications already handled by useResumeApi.
  } finally {
    busy.value = false
  }
}

function editEducation(item: ResumeEducation) {
  editingEducationId.value = item.id
  educationForm.value = { ...item }
}

async function submitEducation() {
  if (!await validateForm(educationFormRef.value)) {
    Notify.error('La formation contient des erreurs. Merci de les corriger.')
    return
  }

  busy.value = true
  try {
    const payload = { ...educationForm.value, resume: resumeId.value }
    if (editingEducationId.value) {
      await updateResumeEducation(editingEducationId.value, payload)
    } else {
      await createResumeEducation(payload as never)
    }
    await loadData()
  } catch {
    // Notifications already handled by useResumeApi.
  } finally {
    busy.value = false
  }
}

async function patchSelectedEducation() {
  if (!editingEducationId.value) return
  busy.value = true
  try {
    await patchResumeEducation(editingEducationId.value, educationForm.value)
    await loadData()
  } catch {
    // Notifications already handled by useResumeApi.
  } finally {
    busy.value = false
  }
}

async function removeEducation(id: string) {
  busy.value = true
  try {
    await deleteResumeEducation(id)
    await loadData()
  } catch {
    // Notifications already handled by useResumeApi.
  } finally {
    busy.value = false
  }
}

function editSkill(item: ResumeSkill) {
  editingSkillId.value = item.id
  skillForm.value = { ...item }
}

async function submitSkill() {
  if (!await validateForm(skillFormRef.value)) {
    Notify.error('La compétence contient des erreurs. Merci de les corriger.')
    return
  }

  busy.value = true
  try {
    const payload = { ...skillForm.value, resume: resumeId.value }
    if (editingSkillId.value) {
      await updateResumeSkill(editingSkillId.value, payload)
    } else {
      await createResumeSkill(payload as never)
    }
    await loadData()
  } catch {
    // Notifications already handled by useResumeApi.
  } finally {
    busy.value = false
  }
}

async function patchSelectedSkill() {
  if (!editingSkillId.value) return
  busy.value = true
  try {
    await patchResumeSkill(editingSkillId.value, skillForm.value)
    await loadData()
  } catch {
    // Notifications already handled by useResumeApi.
  } finally {
    busy.value = false
  }
}

async function removeSkill(id: string) {
  busy.value = true
  try {
    await deleteResumeSkill(id)
    await loadData()
  } catch {
    // Notifications already handled by useResumeApi.
  } finally {
    busy.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <v-container class="py-6">
    <div class="d-flex justify-space-between align-center mb-4 ga-2 flex-wrap">
      <h1 class="text-h5">{{ resume?.title || 'CV' }}</h1>
      <div class="d-flex ga-2">
        <v-btn variant="text" to="/resumes">Retour</v-btn>
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

      <v-expansion-panel title="Expériences">
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

      <v-expansion-panel title="Formations">
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

      <v-expansion-panel title="Compétences">
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

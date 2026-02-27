import type {
  CreateResumeEducationPayload,
  CreateResumeExperiencePayload,
  CreateResumePayload,
  CreateResumeSkillPayload,
  PatchResumeEducationPayload,
  PatchResumeExperiencePayload,
  PatchResumePayload,
  PatchResumeSkillPayload,
  Resume,
  ResumeEducation,
  ResumeExperience,
  ResumeSkill,
  UpdateResumeEducationPayload,
  UpdateResumeExperiencePayload,
  UpdateResumePayload,
  UpdateResumeSkillPayload,
} from '~/composables/useResumeApi'
import {
  mapResumeApiToFormModel,
  mapResumeEducationApiToFormModel,
  mapResumeEducationFormModelToCreatePayload,
  mapResumeEducationFormModelToPatchPayload,
  mapResumeEducationFormModelToUpdatePayload,
  mapResumeExperienceApiToFormModel,
  mapResumeExperienceFormModelToCreatePayload,
  mapResumeExperienceFormModelToPatchPayload,
  mapResumeExperienceFormModelToUpdatePayload,
  mapResumeFormModelToCreatePayload,
  mapResumeFormModelToPatchPayload,
  mapResumeFormModelToUpdatePayload,
  mapResumeSkillApiToFormModel,
  mapResumeSkillFormModelToCreatePayload,
  mapResumeSkillFormModelToPatchPayload,
  mapResumeSkillFormModelToUpdatePayload,
} from '~/domain/resume/mappers'
import type {
  ResumeEducationFormModel,
  ResumeExperienceFormModel,
  ResumeFormModel,
  ResumeSkillFormModel,
} from '~/types/resume'

export const useResumeStore = defineStore('resume', () => {
  const api = useResumeApi()

  const currentResume = ref<Resume | null>(null)
  const resumeList = ref<Resume[]>([])
  const experiencesByResumeId = ref<Record<string, ResumeExperience[]>>({})
  const educationsByResumeId = ref<Record<string, ResumeEducation[]>>({})
  const skillsByResumeId = ref<Record<string, ResumeSkill[]>>({})

  const loadingByAction = ref<Record<string, boolean>>({})
  const errorByAction = ref<Record<string, string | null>>({})
  const dirtyFlags = ref<Record<string, boolean>>({})

  function toErrorMessage(errorValue: unknown) {
    if (errorValue instanceof Error) return errorValue.message
    return 'Une erreur est survenue.'
  }

  async function withAction<T>(action: string, run: () => Promise<T>): Promise<T> {
    loadingByAction.value[action] = true
    errorByAction.value[action] = null

    try {
      return await run()
    } catch (errorValue) {
      errorByAction.value[action] = toErrorMessage(errorValue)
      throw errorValue
    } finally {
      loadingByAction.value[action] = false
    }
  }

  function markDirty(flag: string, value = true) {
    dirtyFlags.value[flag] = value
  }

  async function fetchResumeList() {
    return withAction('fetchResumeList', async () => {
      const response = await api.getMyResumes({ limit: 50, order: 'updatedAt:desc' })
      resumeList.value = response.data || []
      return resumeList.value
    })
  }

  async function fetchResumeAggregate(resumeId: string) {
    return withAction('fetchResumeAggregate', async () => {
      const [resumeResponse, experiencesResponse, educationResponse, skillsResponse] = await Promise.all([
        api.getResume(resumeId),
        api.getResumeExperiences({ where: { resume: resumeId }, limit: 100 }),
        api.getResumeEducationList({ where: { resume: resumeId }, limit: 100 }),
        api.getResumeSkills({ where: { resume: resumeId }, limit: 100 }),
      ])

      currentResume.value = resumeResponse
      experiencesByResumeId.value[resumeId] = experiencesResponse.data || []
      educationsByResumeId.value[resumeId] = educationResponse.data || []
      skillsByResumeId.value[resumeId] = skillsResponse.data || []
      markDirty(`resume:${resumeId}`, false)
      return resumeResponse
    })
  }

  async function saveResume(payload: CreateResumePayload) {
    return withAction('saveResume', async () => {
      const created = await api.createResume(payload)
      currentResume.value = created
      resumeList.value = [created, ...resumeList.value.filter((resume) => resume.id !== created.id)]
      markDirty(`resume:${created.id}`, false)
      return created
    })
  }

  async function saveResumeFromForm(form: ResumeFormModel) {
    return saveResume(mapResumeFormModelToCreatePayload(form))
  }

  async function patchResume(resumeId: string, payload: PatchResumePayload) {
    return withAction('patchResume', async () => {
      const patched = await api.patchResume(resumeId, payload)
      currentResume.value = patched
      resumeList.value = resumeList.value.map((resume) => resume.id === resumeId ? patched : resume)
      markDirty(`resume:${resumeId}`, false)
      return patched
    })
  }

  async function patchResumeFromForm(resumeId: string, form: ResumeFormModel, previous?: ResumeFormModel) {
    return patchResume(resumeId, mapResumeFormModelToPatchPayload(form, previous))
  }

  async function updateResume(resumeId: string, payload: UpdateResumePayload) {
    return withAction('updateResume', async () => {
      const updated = await api.updateResume(resumeId, payload)
      currentResume.value = updated
      resumeList.value = resumeList.value.map((resume) => resume.id === resumeId ? updated : resume)
      markDirty(`resume:${resumeId}`, false)
      return updated
    })
  }

  async function updateResumeFromForm(resumeId: string, form: ResumeFormModel) {
    return updateResume(resumeId, mapResumeFormModelToUpdatePayload(form))
  }

  async function deleteResume(resumeId: string) {
    return withAction('deleteResume', async () => {
      await api.deleteResume(resumeId)
      resumeList.value = resumeList.value.filter((resume) => resume.id !== resumeId)
      if (currentResume.value?.id === resumeId) currentResume.value = null

      const { [resumeId]: _removedExperience, ...nextExperiences } = experiencesByResumeId.value
      const { [resumeId]: _removedEducation, ...nextEducations } = educationsByResumeId.value
      const { [resumeId]: _removedSkill, ...nextSkills } = skillsByResumeId.value
      const dirtyKey = `resume:${resumeId}`
      const { [dirtyKey]: _removedDirty, ...nextDirtyFlags } = dirtyFlags.value

      experiencesByResumeId.value = nextExperiences
      educationsByResumeId.value = nextEducations
      skillsByResumeId.value = nextSkills
      dirtyFlags.value = nextDirtyFlags
    })
  }

  async function createExperience(payload: CreateResumeExperiencePayload) {
    return withAction('createExperience', async () => {
      const created = await api.createResumeExperience(payload)
      const key = payload.resume
      experiencesByResumeId.value[key] = [...(experiencesByResumeId.value[key] || []), created]
      markDirty(`experience:${key}`, false)
      return created
    })
  }

  async function createExperienceFromForm(form: ResumeExperienceFormModel) {
    return createExperience(mapResumeExperienceFormModelToCreatePayload(form))
  }

  async function updateExperience(id: string, payload: UpdateResumeExperiencePayload) {
    return withAction('updateExperience', async () => {
      const updated = await api.updateResumeExperience(id, payload)
      const key = updated.resume
      experiencesByResumeId.value[key] = (experiencesByResumeId.value[key] || []).map((item) => item.id === id ? updated : item)
      markDirty(`experience:${key}`, false)
      return updated
    })
  }

  async function updateExperienceFromForm(id: string, form: ResumeExperienceFormModel) {
    return updateExperience(id, mapResumeExperienceFormModelToUpdatePayload(form))
  }

  async function patchExperience(id: string, payload: PatchResumeExperiencePayload) {
    return withAction('patchExperience', async () => {
      const patched = await api.patchResumeExperience(id, payload)
      const key = patched.resume
      experiencesByResumeId.value[key] = (experiencesByResumeId.value[key] || []).map((item) => item.id === id ? patched : item)
      markDirty(`experience:${key}`, false)
      return patched
    })
  }

  async function patchExperienceFromForm(id: string, form: ResumeExperienceFormModel, previous?: ResumeExperienceFormModel) {
    return patchExperience(id, mapResumeExperienceFormModelToPatchPayload(form, previous))
  }

  async function deleteExperience(id: string, resumeId: string) {
    return withAction('deleteExperience', async () => {
      await api.deleteResumeExperience(id)
      experiencesByResumeId.value[resumeId] = (experiencesByResumeId.value[resumeId] || []).filter((item) => item.id !== id)
      markDirty(`experience:${resumeId}`, false)
    })
  }

  async function createEducation(payload: CreateResumeEducationPayload) {
    return withAction('createEducation', async () => {
      const created = await api.createResumeEducation(payload)
      const key = payload.resume
      educationsByResumeId.value[key] = [...(educationsByResumeId.value[key] || []), created]
      markDirty(`education:${key}`, false)
      return created
    })
  }

  async function createEducationFromForm(form: ResumeEducationFormModel) {
    return createEducation(mapResumeEducationFormModelToCreatePayload(form))
  }

  async function updateEducation(id: string, payload: UpdateResumeEducationPayload) {
    return withAction('updateEducation', async () => {
      const updated = await api.updateResumeEducation(id, payload)
      const key = updated.resume
      educationsByResumeId.value[key] = (educationsByResumeId.value[key] || []).map((item) => item.id === id ? updated : item)
      markDirty(`education:${key}`, false)
      return updated
    })
  }

  async function updateEducationFromForm(id: string, form: ResumeEducationFormModel) {
    return updateEducation(id, mapResumeEducationFormModelToUpdatePayload(form))
  }

  async function patchEducation(id: string, payload: PatchResumeEducationPayload) {
    return withAction('patchEducation', async () => {
      const patched = await api.patchResumeEducation(id, payload)
      const key = patched.resume
      educationsByResumeId.value[key] = (educationsByResumeId.value[key] || []).map((item) => item.id === id ? patched : item)
      markDirty(`education:${key}`, false)
      return patched
    })
  }

  async function patchEducationFromForm(id: string, form: ResumeEducationFormModel, previous?: ResumeEducationFormModel) {
    return patchEducation(id, mapResumeEducationFormModelToPatchPayload(form, previous))
  }

  async function deleteEducation(id: string, resumeId: string) {
    return withAction('deleteEducation', async () => {
      await api.deleteResumeEducation(id)
      educationsByResumeId.value[resumeId] = (educationsByResumeId.value[resumeId] || []).filter((item) => item.id !== id)
      markDirty(`education:${resumeId}`, false)
    })
  }

  async function createSkill(payload: CreateResumeSkillPayload) {
    return withAction('createSkill', async () => {
      const created = await api.createResumeSkill(payload)
      const key = payload.resume
      skillsByResumeId.value[key] = [...(skillsByResumeId.value[key] || []), created]
      markDirty(`skill:${key}`, false)
      return created
    })
  }

  async function createSkillFromForm(form: ResumeSkillFormModel) {
    return createSkill(mapResumeSkillFormModelToCreatePayload(form))
  }

  async function updateSkill(id: string, payload: UpdateResumeSkillPayload) {
    return withAction('updateSkill', async () => {
      const updated = await api.updateResumeSkill(id, payload)
      const key = updated.resume
      skillsByResumeId.value[key] = (skillsByResumeId.value[key] || []).map((item) => item.id === id ? updated : item)
      markDirty(`skill:${key}`, false)
      return updated
    })
  }

  async function updateSkillFromForm(id: string, form: ResumeSkillFormModel) {
    return updateSkill(id, mapResumeSkillFormModelToUpdatePayload(form))
  }

  async function patchSkill(id: string, payload: PatchResumeSkillPayload) {
    return withAction('patchSkill', async () => {
      const patched = await api.patchResumeSkill(id, payload)
      const key = patched.resume
      skillsByResumeId.value[key] = (skillsByResumeId.value[key] || []).map((item) => item.id === id ? patched : item)
      markDirty(`skill:${key}`, false)
      return patched
    })
  }

  async function patchSkillFromForm(id: string, form: ResumeSkillFormModel, previous?: ResumeSkillFormModel) {
    return patchSkill(id, mapResumeSkillFormModelToPatchPayload(form, previous))
  }

  async function deleteSkill(id: string, resumeId: string) {
    return withAction('deleteSkill', async () => {
      await api.deleteResumeSkill(id)
      skillsByResumeId.value[resumeId] = (skillsByResumeId.value[resumeId] || []).filter((item) => item.id !== id)
      markDirty(`skill:${resumeId}`, false)
    })
  }

  const currentResumeExperiences = computed(() => currentResume.value ? (experiencesByResumeId.value[currentResume.value.id] || []) : [])
  const currentResumeEducations = computed(() => currentResume.value ? (educationsByResumeId.value[currentResume.value.id] || []) : [])
  const currentResumeSkills = computed(() => currentResume.value ? (skillsByResumeId.value[currentResume.value.id] || []) : [])

  const experienceCount = computed(() => currentResumeExperiences.value.length)
  const educationCount = computed(() => currentResumeEducations.value.length)
  const skillCount = computed(() => currentResumeSkills.value.length)
  const isBusy = computed(() => Object.values(loadingByAction.value).some(Boolean))

  return {
    currentResume,
    resumeList,
    experiencesByResumeId,
    educationsByResumeId,
    skillsByResumeId,
    loadingByAction,
    errorByAction,
    dirtyFlags,
    currentResumeExperiences,
    currentResumeEducations,
    currentResumeSkills,
    experienceCount,
    educationCount,
    skillCount,
    isBusy,
    markDirty,
    mapResumeApiToFormModel,
    mapResumeExperienceApiToFormModel,
    mapResumeEducationApiToFormModel,
    mapResumeSkillApiToFormModel,
    fetchResumeList,
    fetchResumeAggregate,
    saveResume,
    saveResumeFromForm,
    updateResume,
    updateResumeFromForm,
    patchResume,
    patchResumeFromForm,
    deleteResume,
    createExperience,
    createExperienceFromForm,
    updateExperience,
    updateExperienceFromForm,
    patchExperience,
    patchExperienceFromForm,
    deleteExperience,
    createEducation,
    createEducationFromForm,
    updateEducation,
    updateEducationFromForm,
    patchEducation,
    patchEducationFromForm,
    deleteEducation,
    createSkill,
    createSkillFromForm,
    updateSkill,
    updateSkillFromForm,
    patchSkill,
    patchSkillFromForm,
    deleteSkill,
  }
})

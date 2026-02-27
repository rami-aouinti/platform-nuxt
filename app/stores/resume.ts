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
import { createCrudEntityStore } from '~/stores/_factories/createCrudEntityStore'
import { getErrorMessage, notifyCrudError, notifyCrudSuccess } from '~/stores/_factories/storeNotifications'
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

  const activeResumeId = ref<string>('')

  const experienceCrud = createCrudEntityStore<ResumeExperience, CreateResumeExperiencePayload, UpdateResumeExperiencePayload, PatchResumeExperiencePayload>({
    entityLabel: 'Expérience',
    fetch: async () => {
      const response = await api.getResumeExperiences({ where: { resume: activeResumeId.value }, limit: 100 })
      return response.data || []
    },
    create: payload => api.createResumeExperience(payload),
    update: (id, payload) => api.updateResumeExperience(id, payload),
    patch: (id, payload) => api.patchResumeExperience(id, payload),
    remove: id => api.deleteResumeExperience(id),
    getId: entity => entity.id,
    applyUpdate: (entity, payload) => ({ ...entity, ...payload }),
    applyPatch: (entity, payload) => ({ ...entity, ...payload }),
    notifier: {
      success: action => notifyCrudSuccess('Expérience', action),
      error: (action, errorValue) => notifyCrudError('Expérience', action, errorValue),
    },
  })

  const educationCrud = createCrudEntityStore<ResumeEducation, CreateResumeEducationPayload, UpdateResumeEducationPayload, PatchResumeEducationPayload>({
    entityLabel: 'Formation',
    fetch: async () => {
      const response = await api.getResumeEducationList({ where: { resume: activeResumeId.value }, limit: 100 })
      return response.data || []
    },
    create: payload => api.createResumeEducation(payload),
    update: (id, payload) => api.updateResumeEducation(id, payload),
    patch: (id, payload) => api.patchResumeEducation(id, payload),
    remove: id => api.deleteResumeEducation(id),
    getId: entity => entity.id,
    applyUpdate: (entity, payload) => ({ ...entity, ...payload }),
    applyPatch: (entity, payload) => ({ ...entity, ...payload }),
    notifier: {
      success: action => notifyCrudSuccess('Formation', action),
      error: (action, errorValue) => notifyCrudError('Formation', action, errorValue),
    },
  })

  const skillCrud = createCrudEntityStore<ResumeSkill, CreateResumeSkillPayload, UpdateResumeSkillPayload, PatchResumeSkillPayload>({
    entityLabel: 'Compétence',
    fetch: async () => {
      const response = await api.getResumeSkills({ where: { resume: activeResumeId.value }, limit: 100 })
      return response.data || []
    },
    create: payload => api.createResumeSkill(payload),
    update: (id, payload) => api.updateResumeSkill(id, payload),
    patch: (id, payload) => api.patchResumeSkill(id, payload),
    remove: id => api.deleteResumeSkill(id),
    getId: entity => entity.id,
    applyUpdate: (entity, payload) => ({ ...entity, ...payload }),
    applyPatch: (entity, payload) => ({ ...entity, ...payload }),
    notifier: {
      success: action => notifyCrudSuccess('Compétence', action),
      error: (action, errorValue) => notifyCrudError('Compétence', action, errorValue),
    },
  })

  function markDirty(flag: string, value = true) {
    dirtyFlags.value[flag] = value
  }

  function syncEntityMaps(resumeId: string) {
    experiencesByResumeId.value[resumeId] = [...experienceCrud.rows.value]
    educationsByResumeId.value[resumeId] = [...educationCrud.rows.value]
    skillsByResumeId.value[resumeId] = [...skillCrud.rows.value]
  }

  async function withAction<T>(action: string, run: () => Promise<T>, notify?: { entityLabel: string, kind: 'fetch' | 'create' | 'update' | 'patch' | 'remove' }): Promise<T> {
    loadingByAction.value[action] = true
    errorByAction.value[action] = null

    try {
      const result = await run()
      if (notify) notifyCrudSuccess(notify.entityLabel, notify.kind)
      return result
    } catch (errorValue) {
      errorByAction.value[action] = getErrorMessage(errorValue)
      if (notify) notifyCrudError(notify.entityLabel, notify.kind, errorValue)
      throw errorValue
    } finally {
      loadingByAction.value[action] = false
    }
  }

  async function fetchResumeList() {
    return withAction('fetchResumeList', async () => {
      const response = await api.getMyResumes({ limit: 50, order: 'updatedAt:desc' })
      resumeList.value = response.data || []
      return resumeList.value
    }, { entityLabel: 'CV', kind: 'fetch' })
  }

  async function fetchResumeAggregate(resumeId: string) {
    return withAction('fetchResumeAggregate', async () => {
      activeResumeId.value = resumeId

      const [resumeResponse] = await Promise.all([
        api.getResume(resumeId),
        experienceCrud.fetch(),
        educationCrud.fetch(),
        skillCrud.fetch(),
      ])

      currentResume.value = resumeResponse
      syncEntityMaps(resumeId)
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
    }, { entityLabel: 'CV', kind: 'create' })
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
    }, { entityLabel: 'CV', kind: 'patch' })
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
    }, { entityLabel: 'CV', kind: 'update' })
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

      if (activeResumeId.value === resumeId) {
        activeResumeId.value = ''
        experienceCrud.setRows([])
        educationCrud.setRows([])
        skillCrud.setRows([])
      }
    }, { entityLabel: 'CV', kind: 'remove' })
  }

  async function createExperience(payload: CreateResumeExperiencePayload) {
    activeResumeId.value = payload.resume
    const created = await experienceCrud.create(payload)
    syncEntityMaps(payload.resume)
    markDirty(`experience:${payload.resume}`, false)
    return created
  }

  async function createExperienceFromForm(form: ResumeExperienceFormModel) {
    return createExperience(mapResumeExperienceFormModelToCreatePayload(form))
  }

  async function updateExperience(id: string, payload: UpdateResumeExperiencePayload) {
    activeResumeId.value = payload.resume
    const updated = await experienceCrud.update(id, payload)
    syncEntityMaps(payload.resume)
    markDirty(`experience:${payload.resume}`, false)
    return updated
  }

  async function updateExperienceFromForm(id: string, form: ResumeExperienceFormModel) {
    return updateExperience(id, mapResumeExperienceFormModelToUpdatePayload(form))
  }

  async function patchExperience(id: string, payload: PatchResumeExperiencePayload) {
    const resumeId = activeResumeId.value || currentResume.value?.id || ''
    const patched = await experienceCrud.patch(id, payload)
    if (resumeId) {
      syncEntityMaps(resumeId)
      markDirty(`experience:${resumeId}`, false)
    }
    return patched
  }

  async function patchExperienceFromForm(id: string, form: ResumeExperienceFormModel, previous?: ResumeExperienceFormModel) {
    return patchExperience(id, mapResumeExperienceFormModelToPatchPayload(form, previous))
  }

  async function deleteExperience(id: string, resumeId: string) {
    activeResumeId.value = resumeId
    await experienceCrud.remove(id)
    syncEntityMaps(resumeId)
    markDirty(`experience:${resumeId}`, false)
  }

  async function createEducation(payload: CreateResumeEducationPayload) {
    activeResumeId.value = payload.resume
    const created = await educationCrud.create(payload)
    syncEntityMaps(payload.resume)
    markDirty(`education:${payload.resume}`, false)
    return created
  }

  async function createEducationFromForm(form: ResumeEducationFormModel) {
    return createEducation(mapResumeEducationFormModelToCreatePayload(form))
  }

  async function updateEducation(id: string, payload: UpdateResumeEducationPayload) {
    activeResumeId.value = payload.resume
    const updated = await educationCrud.update(id, payload)
    syncEntityMaps(payload.resume)
    markDirty(`education:${payload.resume}`, false)
    return updated
  }

  async function updateEducationFromForm(id: string, form: ResumeEducationFormModel) {
    return updateEducation(id, mapResumeEducationFormModelToUpdatePayload(form))
  }

  async function patchEducation(id: string, payload: PatchResumeEducationPayload) {
    const resumeId = activeResumeId.value || currentResume.value?.id || ''
    const patched = await educationCrud.patch(id, payload)
    if (resumeId) {
      syncEntityMaps(resumeId)
      markDirty(`education:${resumeId}`, false)
    }
    return patched
  }

  async function patchEducationFromForm(id: string, form: ResumeEducationFormModel, previous?: ResumeEducationFormModel) {
    return patchEducation(id, mapResumeEducationFormModelToPatchPayload(form, previous))
  }

  async function deleteEducation(id: string, resumeId: string) {
    activeResumeId.value = resumeId
    await educationCrud.remove(id)
    syncEntityMaps(resumeId)
    markDirty(`education:${resumeId}`, false)
  }

  async function createSkill(payload: CreateResumeSkillPayload) {
    activeResumeId.value = payload.resume
    const created = await skillCrud.create(payload)
    syncEntityMaps(payload.resume)
    markDirty(`skill:${payload.resume}`, false)
    return created
  }

  async function createSkillFromForm(form: ResumeSkillFormModel) {
    return createSkill(mapResumeSkillFormModelToCreatePayload(form))
  }

  async function updateSkill(id: string, payload: UpdateResumeSkillPayload) {
    activeResumeId.value = payload.resume
    const updated = await skillCrud.update(id, payload)
    syncEntityMaps(payload.resume)
    markDirty(`skill:${payload.resume}`, false)
    return updated
  }

  async function updateSkillFromForm(id: string, form: ResumeSkillFormModel) {
    return updateSkill(id, mapResumeSkillFormModelToUpdatePayload(form))
  }

  async function patchSkill(id: string, payload: PatchResumeSkillPayload) {
    const resumeId = activeResumeId.value || currentResume.value?.id || ''
    const patched = await skillCrud.patch(id, payload)
    if (resumeId) {
      syncEntityMaps(resumeId)
      markDirty(`skill:${resumeId}`, false)
    }
    return patched
  }

  async function patchSkillFromForm(id: string, form: ResumeSkillFormModel, previous?: ResumeSkillFormModel) {
    return patchSkill(id, mapResumeSkillFormModelToPatchPayload(form, previous))
  }

  async function deleteSkill(id: string, resumeId: string) {
    activeResumeId.value = resumeId
    await skillCrud.remove(id)
    syncEntityMaps(resumeId)
    markDirty(`skill:${resumeId}`, false)
  }

  const currentResumeExperiences = computed(() => experienceCrud.rows.value)
  const currentResumeEducations = computed(() => educationCrud.rows.value)
  const currentResumeSkills = computed(() => skillCrud.rows.value)

  const experienceCount = computed(() => currentResumeExperiences.value.length)
  const educationCount = computed(() => currentResumeEducations.value.length)
  const skillCount = computed(() => currentResumeSkills.value.length)
  const isBusy = computed(() => Object.values(loadingByAction.value).some(Boolean) || experienceCrud.saving.value || educationCrud.saving.value || skillCrud.saving.value)

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

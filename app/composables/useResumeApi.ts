import { HttpRequestError, type HttpMethod, httpRequest } from '../../services/http/client'
import { Notify } from '~/stores/notification'

export type Id = string

export interface ResumeListQuery {
  limit?: number
  offset?: number
  order?: string
  search?: string
  where?: Record<string, string | number | boolean | null | undefined>
  tenant?: string
}

export enum ResumeEmploymentType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACT = 'contract',
  FREELANCE = 'freelance',
  INTERNSHIP = 'internship',
  APPRENTICESHIP = 'apprenticeship',
  TEMPORARY = 'temporary',
}

export enum ResumeEducationLevel {
  HIGH_SCHOOL = 'high-school',
  ASSOCIATE = 'associate',
  BACHELOR = 'bachelor',
  MASTER = 'master',
  DOCTORATE = 'doctorate',
  OTHER = 'other',
}

export enum ResumeSkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export interface Resume {
  id: Id
  user?: string
  title?: string
  headline?: string
  summary?: string
  location?: string
  isPublic?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateResumePayload {
  title: string
  headline?: string
  summary?: string
  location?: string
  isPublic?: boolean
  tenant?: string
}

export interface UpdateResumePayload {
  title?: string
  headline?: string
  summary?: string
  location?: string
  isPublic?: boolean
  tenant?: string
}

export type PatchResumePayload = Partial<UpdateResumePayload>

export interface ResumeExperience {
  id: Id
  resume: string
  company: string
  role: string
  startDate: string
  endDate?: string | null
  description?: string
  employmentType?: ResumeEmploymentType
  location?: string
  isCurrent?: boolean
}

export interface CreateResumeExperiencePayload {
  resume: string
  company: string
  role: string
  startDate: string
  endDate?: string | null
  description?: string
  employmentType?: ResumeEmploymentType
  location?: string
  isCurrent?: boolean
  tenant?: string
}

export type UpdateResumeExperiencePayload = Partial<CreateResumeExperiencePayload>

export type PatchResumeExperiencePayload = Partial<UpdateResumeExperiencePayload>

export interface ResumeEducation {
  id: Id
  resume: string
  institution: string
  degree?: string
  fieldOfStudy?: string
  level?: ResumeEducationLevel
  startDate?: string
  endDate?: string | null
  description?: string
  isCurrent?: boolean
}

export interface CreateResumeEducationPayload {
  resume: string
  institution: string
  degree?: string
  fieldOfStudy?: string
  level?: ResumeEducationLevel
  startDate?: string
  endDate?: string | null
  description?: string
  isCurrent?: boolean
  tenant?: string
}

export type UpdateResumeEducationPayload = Partial<CreateResumeEducationPayload>

export type PatchResumeEducationPayload = Partial<UpdateResumeEducationPayload>

export interface ResumeSkill {
  id: Id
  resume: string
  name: string
  level?: ResumeSkillLevel
  yearsOfExperience?: number
}

export interface CreateResumeSkillPayload {
  resume: string
  name: string
  level?: ResumeSkillLevel
  yearsOfExperience?: number
  tenant?: string
}

export type UpdateResumeSkillPayload = Partial<CreateResumeSkillPayload>

export type PatchResumeSkillPayload = Partial<UpdateResumeSkillPayload>

export interface PaginatedResponse<T> {
  data: T[]
  meta?: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

function normalizeQuery(query: ResumeListQuery = {}) {
  const where = query.where && Object.keys(query.where).length
    ? JSON.stringify(query.where)
    : undefined

  return {
    ...(query.limit !== undefined ? { limit: query.limit } : {}),
    ...(query.offset !== undefined ? { offset: query.offset } : {}),
    ...(query.order ? { order: query.order } : {}),
    ...(query.search ? { search: query.search } : {}),
    ...(where ? { where } : {}),
    ...(query.tenant ? { tenant: query.tenant } : {}),
  }
}

function request<T>(method: HttpMethod, path: string, options: { query?: ResumeListQuery; body?: unknown } = {}) {
  const headers = new Headers()
  headers.set('Content-Type', 'application/json')

  return httpRequest<T>(method, path, {
    headers,
    ...(options.query ? { query: normalizeQuery(options.query) } : {}),
    ...(options.body !== undefined ? { body: options.body } : {}),
  })
}

function collectFieldErrors(details: unknown): string[] {
  if (!details) {
    return []
  }

  if (Array.isArray(details)) {
    return details.flatMap((entry) => collectFieldErrors(entry))
  }

  if (typeof details === 'string') {
    return [details]
  }

  if (typeof details !== 'object') {
    return []
  }

  const objectDetails = details as Record<string, unknown>

  if ('field' in objectDetails && 'message' in objectDetails && typeof objectDetails.field === 'string' && typeof objectDetails.message === 'string') {
    return [`${objectDetails.field}: ${objectDetails.message}`]
  }

  return Object.entries(objectDetails).flatMap(([key, value]) => {
    if (Array.isArray(value)) {
      return value
        .map((item) => typeof item === 'string' ? `${key}: ${item}` : '')
        .filter(Boolean)
    }

    if (typeof value === 'string') {
      return [`${key}: ${value}`]
    }

    return collectFieldErrors(value)
  })
}

function getResumeCrudErrorMessage(errorValue: unknown): string {
  if (!(errorValue instanceof HttpRequestError)) {
    if (errorValue instanceof Error) {
      return errorValue.message
    }

    return 'Une erreur API est survenue.'
  }

  if (errorValue.statusCode === 401) {
    return 'Session expirée ou non authentifiée. Veuillez vous reconnecter.'
  }

  if (errorValue.statusCode === 403) {
    return "Action interdite : ce CV appartient à un autre utilisateur."
  }

  if (errorValue.statusCode === 404) {
    return 'CV introuvable ou CV privé non accessible.'
  }

  if (errorValue.statusCode === 400) {
    const fieldErrors = collectFieldErrors(errorValue.details)
    if (fieldErrors.length) {
      return `Payload invalide : ${fieldErrors.join(' · ')}`
    }
    return 'Payload invalide. Vérifiez les données envoyées.'
  }

  return errorValue.message || 'Une erreur API est survenue.'
}

async function withCrudNotifications<T>(messages: { success: string; errorContext: string }, run: () => Promise<T>): Promise<T> {
  try {
    const result = await run()
    Notify.success(messages.success)
    return result
  } catch (errorValue) {
    const message = getResumeCrudErrorMessage(errorValue)
    Notify.error(`${messages.errorContext} ${message}`)
    throw errorValue
  }
}

function createCrudApi<TItem, TCreate, TUpdate, TPatch>(basePath: string) {
  return {
    list: (query?: ResumeListQuery) => request<PaginatedResponse<TItem>>('GET', basePath, { query }),
    get: (id: Id) => request<TItem>('GET', `${basePath}/${id}`),
    create: (payload: TCreate, notifications?: { success: string; errorContext: string }) => notifications
      ? withCrudNotifications(notifications, () => request<TItem>('POST', basePath, { body: payload }))
      : request<TItem>('POST', basePath, { body: payload }),
    update: (id: Id, payload: TUpdate, notifications?: { success: string; errorContext: string }) => notifications
      ? withCrudNotifications(notifications, () => request<TItem>('PUT', `${basePath}/${id}`, { body: payload }))
      : request<TItem>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: TPatch, notifications?: { success: string; errorContext: string }) => notifications
      ? withCrudNotifications(notifications, () => request<TItem>('PATCH', `${basePath}/${id}`, { body: payload }))
      : request<TItem>('PATCH', `${basePath}/${id}`, { body: payload }),
    remove: (id: Id, notifications?: { success: string; errorContext: string }) => notifications
      ? withCrudNotifications(notifications, () => request<unknown>('DELETE', `${basePath}/${id}`))
      : request<unknown>('DELETE', `${basePath}/${id}`),
  }
}

function omitResumeFromPayload<TPayload extends { resume?: string }>(payload: TPayload) {
  const { resume: _resume, ...rest } = payload
  return rest
}

function createResumeComponentCrudApi<TItem, TCreate extends { resume?: string }, TUpdate extends { resume?: string }, TPatch extends { resume?: string }>(
  nestedPath: (resumeId: Id) => string,
) {
  return {
    list: (resumeId: Id, query?: ResumeListQuery) => request<PaginatedResponse<TItem>>('GET', nestedPath(resumeId), { query }),
    get: (resumeId: Id, id: Id) => request<TItem>('GET', `${nestedPath(resumeId)}/${id}`),
    create: (resumeId: Id, payload: TCreate, notifications?: { success: string; errorContext: string }) => notifications
      ? withCrudNotifications(notifications, () => request<TItem>('POST', nestedPath(resumeId), { body: omitResumeFromPayload(payload) }))
      : request<TItem>('POST', nestedPath(resumeId), { body: omitResumeFromPayload(payload) }),
    update: (resumeId: Id, id: Id, payload: TUpdate, notifications?: { success: string; errorContext: string }) => notifications
      ? withCrudNotifications(notifications, () => request<TItem>('PUT', `${nestedPath(resumeId)}/${id}`, { body: omitResumeFromPayload(payload) }))
      : request<TItem>('PUT', `${nestedPath(resumeId)}/${id}`, { body: omitResumeFromPayload(payload) }),
    patch: (resumeId: Id, id: Id, payload: TPatch, notifications?: { success: string; errorContext: string }) => notifications
      ? withCrudNotifications(notifications, () => request<TItem>('PATCH', `${nestedPath(resumeId)}/${id}`, { body: omitResumeFromPayload(payload) }))
      : request<TItem>('PATCH', `${nestedPath(resumeId)}/${id}`, { body: omitResumeFromPayload(payload) }),
    remove: (resumeId: Id, id: Id, notifications?: { success: string; errorContext: string }) => notifications
      ? withCrudNotifications(notifications, () => request<unknown>('DELETE', `${nestedPath(resumeId)}/${id}`))
      : request<unknown>('DELETE', `${nestedPath(resumeId)}/${id}`),
  }
}

export function useResumeApi() {
  const resumesApi = createCrudApi<Resume, CreateResumePayload, UpdateResumePayload, PatchResumePayload>('/api/v1/me/profile/resumes')
  const experiencesApi = createResumeComponentCrudApi<ResumeExperience, CreateResumeExperiencePayload, UpdateResumeExperiencePayload, PatchResumeExperiencePayload>((resumeId) => `/api/v1/me/profile/resumes/${resumeId}/experiences`)
  const educationApi = createResumeComponentCrudApi<ResumeEducation, CreateResumeEducationPayload, UpdateResumeEducationPayload, PatchResumeEducationPayload>((resumeId) => `/api/v1/me/profile/resumes/${resumeId}/educations`)
  const skillsApi = createResumeComponentCrudApi<ResumeSkill, CreateResumeSkillPayload, UpdateResumeSkillPayload, PatchResumeSkillPayload>((resumeId) => `/api/v1/me/profile/resumes/${resumeId}/skills`)

  return {
    getMyResumes: resumesApi.list,
    getResumes: resumesApi.list,
    getResume: resumesApi.get,
    createResume: (payload: CreateResumePayload) => resumesApi.create(payload, {
      success: 'CV créé.',
      errorContext: 'Création du CV impossible.',
    }),
    updateResume: (id: Id, payload: UpdateResumePayload) => resumesApi.update(id, payload, {
      success: 'CV mis à jour.',
      errorContext: 'Mise à jour du CV impossible.',
    }),
    patchResume: (id: Id, payload: PatchResumePayload) => resumesApi.patch(id, payload, {
      success: 'CV mis à jour.',
      errorContext: 'Mise à jour partielle du CV impossible.',
    }),
    deleteResume: (id: Id) => resumesApi.remove(id, {
      success: 'CV supprimé.',
      errorContext: 'Suppression du CV impossible.',
    }),

    getResumeExperiences: experiencesApi.list,
    getResumeExperience: experiencesApi.get,
    createResumeExperience: (resumeId: Id, payload: CreateResumeExperiencePayload) => experiencesApi.create(resumeId, payload, {
      success: 'Expérience créée.',
      errorContext: "Création de l'expérience impossible.",
    }),
    updateResumeExperience: (resumeId: Id, id: Id, payload: UpdateResumeExperiencePayload) => experiencesApi.update(resumeId, id, payload, {
      success: 'Expérience mise à jour.',
      errorContext: "Mise à jour de l'expérience impossible.",
    }),
    patchResumeExperience: (resumeId: Id, id: Id, payload: PatchResumeExperiencePayload) => experiencesApi.patch(resumeId, id, payload, {
      success: 'Expérience mise à jour.',
      errorContext: "Mise à jour partielle de l'expérience impossible.",
    }),
    deleteResumeExperience: (resumeId: Id, id: Id) => experiencesApi.remove(resumeId, id, {
      success: 'Expérience supprimée.',
      errorContext: "Suppression de l'expérience impossible.",
    }),

    getResumeEducationList: educationApi.list,
    getResumeEducation: educationApi.get,
    createResumeEducation: (resumeId: Id, payload: CreateResumeEducationPayload) => educationApi.create(resumeId, payload, {
      success: 'Formation créée.',
      errorContext: 'Création de la formation impossible.',
    }),
    updateResumeEducation: (resumeId: Id, id: Id, payload: UpdateResumeEducationPayload) => educationApi.update(resumeId, id, payload, {
      success: 'Formation mise à jour.',
      errorContext: 'Mise à jour de la formation impossible.',
    }),
    patchResumeEducation: (resumeId: Id, id: Id, payload: PatchResumeEducationPayload) => educationApi.patch(resumeId, id, payload, {
      success: 'Formation mise à jour.',
      errorContext: 'Mise à jour partielle de la formation impossible.',
    }),
    deleteResumeEducation: (resumeId: Id, id: Id) => educationApi.remove(resumeId, id, {
      success: 'Formation supprimée.',
      errorContext: 'Suppression de la formation impossible.',
    }),

    getResumeSkills: skillsApi.list,
    getResumeSkill: skillsApi.get,
    createResumeSkill: (resumeId: Id, payload: CreateResumeSkillPayload) => skillsApi.create(resumeId, payload, {
      success: 'Compétence créée.',
      errorContext: 'Création de la compétence impossible.',
    }),
    updateResumeSkill: (resumeId: Id, id: Id, payload: UpdateResumeSkillPayload) => skillsApi.update(resumeId, id, payload, {
      success: 'Compétence mise à jour.',
      errorContext: 'Mise à jour de la compétence impossible.',
    }),
    patchResumeSkill: (resumeId: Id, id: Id, payload: PatchResumeSkillPayload) => skillsApi.patch(resumeId, id, payload, {
      success: 'Compétence mise à jour.',
      errorContext: 'Mise à jour partielle de la compétence impossible.',
    }),
    deleteResumeSkill: (resumeId: Id, id: Id) => skillsApi.remove(resumeId, id, {
      success: 'Compétence supprimée.',
      errorContext: 'Suppression de la compétence impossible.',
    }),
  }
}

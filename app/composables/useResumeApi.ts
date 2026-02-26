import { type HttpMethod, httpRequest } from '../../services/http/client'

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
  createdAt?: string
  updatedAt?: string
}

export interface CreateResumePayload {
  title: string
  headline?: string
  summary?: string
  location?: string
  tenant?: string
}

export interface UpdateResumePayload {
  title?: string
  headline?: string
  summary?: string
  location?: string
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

function createCrudApi<TItem, TCreate, TUpdate, TPatch>(basePath: string) {
  return {
    list: (query?: ResumeListQuery) => request<PaginatedResponse<TItem>>('GET', basePath, { query }),
    get: (id: Id) => request<TItem>('GET', `${basePath}/${id}`),
    create: (payload: TCreate) => request<TItem>('POST', basePath, { body: payload }),
    update: (id: Id, payload: TUpdate) => request<TItem>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: TPatch) => request<TItem>('PATCH', `${basePath}/${id}`, { body: payload }),
    remove: (id: Id) => request<unknown>('DELETE', `${basePath}/${id}`),
  }
}

export function useResumeApi() {
  const resumesApi = createCrudApi<Resume, CreateResumePayload, UpdateResumePayload, PatchResumePayload>('/api/v1/resumes')
  const experiencesApi = createCrudApi<ResumeExperience, CreateResumeExperiencePayload, UpdateResumeExperiencePayload, PatchResumeExperiencePayload>('/api/v1/resume-experiences')
  const educationApi = createCrudApi<ResumeEducation, CreateResumeEducationPayload, UpdateResumeEducationPayload, PatchResumeEducationPayload>('/api/v1/resume-education')
  const skillsApi = createCrudApi<ResumeSkill, CreateResumeSkillPayload, UpdateResumeSkillPayload, PatchResumeSkillPayload>('/api/v1/resume-skills')

  return {
    getMyResumes: (query?: ResumeListQuery) => request<PaginatedResponse<Resume>>('GET', '/api/v1/resumes/my', { query }),
    getResumes: resumesApi.list,
    getResume: resumesApi.get,
    createResume: resumesApi.create,
    updateResume: resumesApi.update,
    patchResume: resumesApi.patch,
    deleteResume: resumesApi.remove,

    getResumeExperiences: experiencesApi.list,
    getResumeExperience: experiencesApi.get,
    createResumeExperience: experiencesApi.create,
    updateResumeExperience: experiencesApi.update,
    patchResumeExperience: experiencesApi.patch,
    deleteResumeExperience: experiencesApi.remove,

    getResumeEducationList: educationApi.list,
    getResumeEducation: educationApi.get,
    createResumeEducation: educationApi.create,
    updateResumeEducation: educationApi.update,
    patchResumeEducation: educationApi.patch,
    deleteResumeEducation: educationApi.remove,

    getResumeSkills: skillsApi.list,
    getResumeSkill: skillsApi.get,
    createResumeSkill: skillsApi.create,
    updateResumeSkill: skillsApi.update,
    patchResumeSkill: skillsApi.patch,
    deleteResumeSkill: skillsApi.remove,
  }
}

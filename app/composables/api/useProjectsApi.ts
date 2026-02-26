import { apiRequest, type ApiListQuery, type Id, type PaginatedResponse } from './httpUiErrors'

export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  COMPLETED = 'completed',
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface Project {
  id: Id
  name: string
  description?: string | null
  status: ProjectStatus
  priority: ProjectPriority
  dueDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateProjectPayload {
  name: string
  description?: string | null
  status?: ProjectStatus
  priority?: ProjectPriority
  dueDate?: string | null
}

export interface UpdateProjectPayload {
  name: string
  description?: string | null
  status: ProjectStatus
  priority: ProjectPriority
  dueDate?: string | null
}

export type PatchProjectPayload = Partial<UpdateProjectPayload>

const basePath = '/api/v1/projects'

export function useProjectsApi() {
  return {
    list: (query?: ApiListQuery) => apiRequest<PaginatedResponse<Project>>('GET', basePath, { query }),
    get: (id: Id) => apiRequest<Project>('GET', `${basePath}/${id}`),
    create: (payload: CreateProjectPayload) => apiRequest<Project>('POST', basePath, { body: payload }),
    update: (id: Id, payload: UpdateProjectPayload) => apiRequest<Project>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: PatchProjectPayload) => apiRequest<Project>('PATCH', `${basePath}/${id}`, { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),
  }
}

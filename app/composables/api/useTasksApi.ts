import { apiRequest, type ApiListQuery, type Id, type PaginatedResponse } from './httpUiErrors'

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface Task {
  id: Id
  projectId: Id
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string | null
  assigneeId?: Id | null
  createdAt: string
  updatedAt: string
}

export interface CreateTaskPayload {
  projectId: Id
  title: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
  assigneeId?: Id | null
}

export interface UpdateTaskPayload {
  projectId: Id
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string | null
  assigneeId?: Id | null
}

export type PatchTaskPayload = Partial<UpdateTaskPayload>

const basePath = '/api/v1/tasks'

export function useTasksApi() {
  return {
    list: (query?: ApiListQuery) => apiRequest<PaginatedResponse<Task>>('GET', basePath, { query }),
    get: (id: Id) => apiRequest<Task>('GET', `${basePath}/${id}`),
    create: (payload: CreateTaskPayload) => apiRequest<Task>('POST', basePath, { body: payload }),
    update: (id: Id, payload: UpdateTaskPayload) => apiRequest<Task>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: PatchTaskPayload) => apiRequest<Task>('PATCH', `${basePath}/${id}`, { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),

    start: (id: Id) => apiRequest<Task>('PATCH', `${basePath}/${id}/start`),
    complete: (id: Id) => apiRequest<Task>('PATCH', `${basePath}/${id}/complete`),
    archive: (id: Id) => apiRequest<Task>('PATCH', `${basePath}/${id}/archive`),
    reopen: (id: Id) => apiRequest<Task>('PATCH', `${basePath}/${id}/reopen`),
  }
}

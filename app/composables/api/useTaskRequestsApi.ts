import { apiRequest, type ApiListQuery, type Id, type PaginatedResponse } from './httpUiErrors'

export enum TaskRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELED = 'canceled',
}

export enum TaskRequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface TaskRequest {
  id: Id
  taskId: Id
  requesterId: Id
  reason: string
  status: TaskRequestStatus
  priority: TaskRequestPriority
  comment?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTaskRequestPayload {
  taskId: Id
  requesterId: Id
  reason: string
  priority?: TaskRequestPriority
  comment?: string | null
}

export interface UpdateTaskRequestPayload {
  taskId: Id
  requesterId: Id
  reason: string
  status: TaskRequestStatus
  priority: TaskRequestPriority
  comment?: string | null
}

export type PatchTaskRequestPayload = Partial<UpdateTaskRequestPayload>

const basePath = '/api/v1/task-requests'

export function useTaskRequestsApi() {
  return {
    list: (query?: ApiListQuery) => apiRequest<PaginatedResponse<TaskRequest>>('GET', basePath, { query }),
    get: (id: Id) => apiRequest<TaskRequest>('GET', `${basePath}/${id}`),
    create: (payload: CreateTaskRequestPayload) => apiRequest<TaskRequest>('POST', basePath, { body: payload }),
    update: (id: Id, payload: UpdateTaskRequestPayload) => apiRequest<TaskRequest>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: PatchTaskRequestPayload) => apiRequest<TaskRequest>('PATCH', `${basePath}/${id}`, { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),

    approve: (id: Id) => apiRequest<TaskRequest>('PATCH', `${basePath}/${id}/approve`),
    reject: (id: Id) => apiRequest<TaskRequest>('PATCH', `${basePath}/${id}/reject`),
    cancel: (id: Id) => apiRequest<TaskRequest>('PATCH', `${basePath}/${id}/cancel`),
  }
}

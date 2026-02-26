import type { Id } from '~/composables/api/httpUiErrors'

export enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  COMPLETED = 'completed',
}

export interface Project {
  id: Id
  name: string
  description?: string | null
  status: ProjectStatus
  dueDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateProjectPayload {
  name: string
  description?: string | null
  status?: ProjectStatus
  dueDate?: string | null
}

export interface UpdateProjectPayload {
  name: string
  description?: string | null
  status: ProjectStatus
  dueDate?: string | null
}

export type PatchProjectPayload = Partial<UpdateProjectPayload>

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

export enum TaskRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELED = 'canceled',
}

export enum TaskRequestType {
  ACCESS = 'access',
  EXTENSION = 'extension',
  REASSIGNMENT = 'reassignment',
  OTHER = 'other',
}

export interface TaskRequest {
  id: Id
  taskId: Id
  requesterId: Id
  reason: string
  status: TaskRequestStatus
  type: TaskRequestType
  comment?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTaskRequestPayload {
  taskId: Id
  requesterId: Id
  reason: string
  type?: TaskRequestType
  comment?: string | null
}

export interface UpdateTaskRequestPayload {
  taskId: Id
  requesterId: Id
  reason: string
  status: TaskRequestStatus
  type: TaskRequestType
  comment?: string | null
}

export type PatchTaskRequestPayload = Partial<UpdateTaskRequestPayload>

import type { Id } from '~/composables/api/httpUiErrors'

export const ProjectStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  COMPLETED: 'completed',
} as const
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus]

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
  URGENT: 'urgent',
} as const
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority]

export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DONE: 'done',
  ARCHIVED: 'archived',
} as const
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus]

export const TaskRequestStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELED: 'canceled',
  CANCELLED: 'cancelled',
} as const
export type TaskRequestStatus = (typeof TaskRequestStatus)[keyof typeof TaskRequestStatus]

export const TaskRequestType = {
  ACCESS: 'access',
  EXTENSION: 'extension',
  REASSIGNMENT: 'reassignment',
  OTHER: 'other',
  STATUS_CHANGE: 'status_change',
} as const
export type TaskRequestType = (typeof TaskRequestType)[keyof typeof TaskRequestType]

export type CompanyRole = 'owner' | 'member' | string

export interface Company { id: Id; name: string; legalName?: string | null; description?: string | null; role?: CompanyRole | null; photoUrl?: string | null; photo?: string | null; image?: string | null; projectsCount?: number | null; projects?: unknown[] | number | null; stats?: { projectsCount?: number | null } | null }
export interface User { id: Id; username?: string; firstName?: string; lastName?: string; email?: string }
export interface Project { id: Id; name: string; description?: string | null; status: ProjectStatus; dueDate?: string | null; createdAt?: string; updatedAt?: string; photoUrl?: string | null; photo?: string | null; image?: string | null }
export interface Task { id: Id; projectId?: Id; title: string; description?: string | null; priority: TaskPriority; status: TaskStatus; dueDate?: string | null; assigneeId?: Id | null; createdAt?: string; updatedAt?: string; project?: { id?: Id; name?: string } | Id | null | [] }
export interface TaskRequest { id: Id; taskId?: Id; requesterId?: Id | null; reviewerId?: Id | null; reason?: string; status: TaskRequestStatus; type: TaskRequestType; comment?: string | null; note?: string | null; requestedStatus?: TaskStatus | null; time?: string | null; createdAt?: string; updatedAt?: string; task?: { id?: Id } | Id; requester?: User | Id | null; reviewer?: User | Id | null }
export interface Sprint { id: Id; name?: string | null; status?: string | null; goal?: string | null; startDate?: string | null; endDate?: string | null; project?: { id?: Id; name?: string } | Id | null; taskRequests?: TaskRequest[] | null; company?: { id?: Id; name?: string } | Id | null | []; active?: boolean | null }

export type CrmCompany = Company
export type CrmProject = Project
export type CrmSprint = Sprint
export type CrmTask = Task
export type CrmTaskRequest = TaskRequest
export type CrmUser = User

export type ProjectPayload = { name: string; description?: string; status?: ProjectStatus; dueDate?: string | null }
export type CreateProjectPayload = ProjectPayload
export type UpdateProjectPayload = ProjectPayload
export type PatchProjectPayload = Partial<ProjectPayload>

export type TaskPayload = { title: string; description?: string; priority?: TaskPriority; status?: TaskStatus; project?: Id | null; projectId?: Id; dueDate?: string | null; assigneeId?: Id | null }
export type CreateTaskPayload = TaskPayload
export type UpdateTaskPayload = TaskPayload
export type PatchTaskPayload = Partial<TaskPayload>

export type TaskRequestPayload = { task?: Id; taskId?: Id; requesterId?: Id; reason?: string; type?: TaskRequestType; requestedStatus?: TaskStatus; note?: string; comment?: string | null; status?: TaskRequestStatus }
export type CreateTaskRequestPayload = TaskRequestPayload
export type UpdateTaskRequestPayload = TaskRequestPayload
export type PatchTaskRequestPayload = Partial<TaskRequestPayload>

export type SprintPayload = { name: string; company: Id; goal?: string; status?: string; startDate?: string; endDate?: string }
export type CreateSprintPayload = SprintPayload

const taskStatusMapping: Record<string, TaskStatus> = {
  todo: TaskStatus.TODO,
  'to-do': TaskStatus.TODO,
  in_progress: TaskStatus.IN_PROGRESS,
  'in-progress': TaskStatus.IN_PROGRESS,
  underway: TaskStatus.IN_PROGRESS,
  done: TaskStatus.DONE,
  completed: TaskStatus.COMPLETED,
  archived: TaskStatus.ARCHIVED,
}
const taskRequestStatusMapping: Record<string, TaskRequestStatus> = {
  pending: TaskRequestStatus.PENDING,
  approved: TaskRequestStatus.APPROVED,
  rejected: TaskRequestStatus.REJECTED,
  canceled: TaskRequestStatus.CANCELED,
  cancelled: TaskRequestStatus.CANCELLED,
}
const taskPriorityMapping: Record<string, TaskPriority> = {
  low: TaskPriority.LOW,
  medium: TaskPriority.MEDIUM,
  high: TaskPriority.HIGH,
  critical: TaskPriority.CRITICAL,
  urgent: TaskPriority.URGENT,
}

export function toTaskStatus(value: unknown): TaskStatus {
  if (typeof value !== 'string') return TaskStatus.TODO
  return taskStatusMapping[value.toLowerCase()] ?? TaskStatus.TODO
}
export function toTaskRequestStatus(value: unknown): TaskRequestStatus {
  if (typeof value !== 'string') return TaskRequestStatus.PENDING
  return taskRequestStatusMapping[value.toLowerCase()] ?? TaskRequestStatus.PENDING
}
export function toTaskPriority(value: unknown): TaskPriority {
  if (typeof value !== 'string') return TaskPriority.MEDIUM
  return taskPriorityMapping[value.toLowerCase()] ?? TaskPriority.MEDIUM
}
export function normalizeTask(task: Task): Task {
  return { ...task, status: toTaskStatus(task.status), priority: toTaskPriority(task.priority) }
}
export function normalizeTaskRequest(taskRequest: TaskRequest): TaskRequest {
  return {
    ...taskRequest,
    status: toTaskRequestStatus(taskRequest.status),
    requestedStatus: taskRequest.requestedStatus ? toTaskStatus(taskRequest.requestedStatus) : taskRequest.requestedStatus,
  }
}

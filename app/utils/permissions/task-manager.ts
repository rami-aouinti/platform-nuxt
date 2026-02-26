import { ADMIN_ROLE, ROOT_ROLE } from './admin'

export type PermissionId = string | number

export interface TaskManagerUser {
  id?: PermissionId | null
  roles?: string[] | null
}

export interface ProjectPermissionSubject {
  ownerId?: PermissionId | null
  managerIds?: PermissionId[] | null
}

export interface TaskPermissionSubject {
  assigneeId?: PermissionId | null
}

export interface TaskRequestPermissionSubject {
  requesterId?: PermissionId | null
}

export interface TaskRequestContext {
  task?: TaskPermissionSubject | null
  project?: ProjectPermissionSubject | null
}

function normalizeId(value: PermissionId | null | undefined) {
  if (value === null || value === undefined) {
    return null
  }

  return String(value)
}

function hasPrivilegedRole(user: TaskManagerUser | null | undefined) {
  const roles = user?.roles
  return Array.isArray(roles) && (roles.includes(ROOT_ROLE) || roles.includes(ADMIN_ROLE))
}

function isUserId(user: TaskManagerUser | null | undefined, candidateId: PermissionId | null | undefined) {
  const userId = normalizeId(user?.id)
  const targetId = normalizeId(candidateId)

  return Boolean(userId && targetId && userId === targetId)
}

export function canManageProject(user: TaskManagerUser | null | undefined, project: ProjectPermissionSubject | null | undefined) {
  if (hasPrivilegedRole(user)) {
    return true
  }

  if (!project) {
    return false
  }

  if (isUserId(user, project.ownerId)) {
    return true
  }

  const userId = normalizeId(user?.id)
  if (!userId || !Array.isArray(project.managerIds)) {
    return false
  }

  return project.managerIds.some((managerId) => normalizeId(managerId) === userId)
}

export function canManageTask(
  user: TaskManagerUser | null | undefined,
  task: TaskPermissionSubject | null | undefined,
  project: ProjectPermissionSubject | null | undefined,
) {
  if (canManageProject(user, project)) {
    return true
  }

  return Boolean(task && isUserId(user, task.assigneeId))
}

export function canReviewTaskRequest(
  user: TaskManagerUser | null | undefined,
  _taskRequest: TaskRequestPermissionSubject | null | undefined,
  taskContext: TaskRequestContext | null | undefined,
) {
  if (hasPrivilegedRole(user)) {
    return true
  }

  return canManageTask(user, taskContext?.task, taskContext?.project)
}

export function canCancelTaskRequest(
  user: TaskManagerUser | null | undefined,
  taskRequest: TaskRequestPermissionSubject | null | undefined,
) {
  if (hasPrivilegedRole(user)) {
    return true
  }

  return Boolean(taskRequest && isUserId(user, taskRequest.requesterId))
}

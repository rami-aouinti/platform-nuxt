export type { CreateSprintPayload } from '~/types/crm'

import {
  type Company,
  type CompanyRole,
  type CreateProjectPayload,
  type CreateSprintPayload,
  type CreateTaskPayload,
  type CreateTaskRequestPayload,
  type PatchProjectPayload,
  type PatchTaskPayload,
  type PatchTaskRequestPayload,
  type Project,
  type Sprint,
  type Task,
  type TaskPriority,
  type TaskPayload,
  type TaskRequest,
  type TaskStatus,
  type TaskRequestStatus,
  type TaskRequestType,
  type UpdateProjectPayload,
  type UpdateTaskPayload,
  type UpdateTaskRequestPayload,
  type User,
  normalizeTask,
  normalizeTaskRequest,
} from '~/types/crm'

export type CrmCompanyRole = CompanyRole
export type CrmCompany = Company
export type CrmProject = Project
export type CrmSprint = Sprint
export type CrmTask = Task
export type CrmTaskPriority = TaskPriority
export type CrmTaskStatus = TaskStatus
export type CrmTaskRequestStatus = TaskRequestStatus
export type CrmTaskRequest = TaskRequest
export type CrmTaskRequestType = TaskRequestType
export type CrmUser = User

export type CrmCompanyMember = {
  id: string
  user?: {
    id?: string
    username?: string
    firstName?: string
    lastName?: string
    email?: string
  } | null
  role?: string | null
  status?: string | null
  invitedAt?: string | null
  joinedAt?: string | null
}

export type CrmSprintTaskRequestsGroup = {
  task: CrmTask
  taskRequests: CrmTaskRequest[]
}

export type CrmSprintTaskRequestsResponse = {
  sprintId: string
  groupedByTask: CrmSprintTaskRequestsGroup[]
}

export type CreateCompanyPayload = {
  name: string
  description?: string
}

const companiesBase = '/api/v1/companies'
const projectsBase = '/api/v1/projects'
const tasksBase = '/api/v1/tasks'
const taskRequestsBase = '/api/v1/task-requests'
const sprintsBase = '/api/v1/sprints'

function normalizeTaskList(tasks: CrmTask[]) {
  return tasks.map(normalizeTask)
}

function normalizeTaskRequestList(taskRequests: CrmTaskRequest[]) {
  return taskRequests.map(normalizeTaskRequest)
}

function normalizeTaskRequestResponse(response: CrmSprintTaskRequestsResponse): CrmSprintTaskRequestsResponse {
  return {
    ...response,
    groupedByTask: response.groupedByTask.map((group) => ({
      ...group,
      task: normalizeTask(group.task),
      taskRequests: normalizeTaskRequestList(group.taskRequests),
    })),
  }
}

function toTaskPayload(payload: TaskPayload | Partial<TaskPayload>): TaskPayload | Partial<TaskPayload> {
  return {
    ...payload,
    ...(payload.projectId ? { project: payload.projectId } : {}),
  }
}

function toTaskRequestPayload(payload: CreateTaskRequestPayload | UpdateTaskRequestPayload | PatchTaskRequestPayload) {
  return {
    ...payload,
    ...(payload.taskId ? { task: payload.taskId } : {}),
  }
}

export function useCrmApi() {
  return {
    listCompanies: () => $fetch<CrmCompany[]>(companiesBase, { method: 'GET' }),
    createCompany: (payload: CreateCompanyPayload) =>
      $fetch<CrmCompany>(companiesBase, { method: 'POST', body: payload }),

    listProjects: () => $fetch<CrmProject[]>(projectsBase, { method: 'GET' }),
    listCompanyProjects: (companyId: string) =>
      $fetch<CrmProject[]>(`${companiesBase}/${companyId}/projects`, {
        method: 'GET',
      }),
    listCompanyMembers: (companyId: string) =>
      $fetch<CrmCompanyMember[]>(`${companiesBase}/${companyId}/members`, {
        method: 'GET',
      }),
    createProject: (payload: CreateProjectPayload) =>
      $fetch<CrmProject>(projectsBase, { method: 'POST', body: payload }),
    getProject: (id: string) =>
      $fetch<CrmProject>(`${projectsBase}/${id}`, { method: 'GET' }),
    updateProject: (id: string, payload: UpdateProjectPayload) =>
      $fetch<CrmProject>(`${projectsBase}/${id}`, {
        method: 'PUT',
        body: payload,
      }),
    patchProject: (id: string, payload: PatchProjectPayload) =>
      $fetch<CrmProject>(`${projectsBase}/${id}`, {
        method: 'PATCH',
        body: payload,
      }),
    deleteProject: (id: string) =>
      $fetch<unknown>(`${projectsBase}/${id}`, { method: 'DELETE' }),

    listSprints: () => $fetch<CrmSprint[]>(sprintsBase, { method: 'GET' }),
    createSprint: (payload: CreateSprintPayload) =>
      $fetch<CrmSprint>(sprintsBase, { method: 'POST', body: payload }),

    listTasks: async () => normalizeTaskList(await $fetch<CrmTask[]>(tasksBase, { method: 'GET' })),
    listProjectTasks: async (projectId: string) =>
      normalizeTaskList(
        await $fetch<CrmTask[]>(`${projectsBase}/${projectId}/tasks`, {
          method: 'GET',
        }),
      ),
    createTask: async (payload: CreateTaskPayload) =>
      normalizeTask(
        await $fetch<CrmTask>(tasksBase, {
          method: 'POST',
          body: toTaskPayload(payload),
        }),
      ),
    getTask: async (id: string) =>
      normalizeTask(await $fetch<CrmTask>(`${tasksBase}/${id}`, { method: 'GET' })),
    updateTask: async (id: string, payload: UpdateTaskPayload) =>
      normalizeTask(
        await $fetch<CrmTask>(`${tasksBase}/${id}`, { method: 'PUT', body: toTaskPayload(payload) }),
      ),
    patchTask: async (id: string, payload: PatchTaskPayload) =>
      normalizeTask(
        await $fetch<CrmTask>(`${tasksBase}/${id}`, { method: 'PATCH', body: toTaskPayload(payload) }),
      ),
    deleteTask: (id: string) =>
      $fetch<unknown>(`${tasksBase}/${id}`, { method: 'DELETE' }),
    startTask: async (id: string) =>
      normalizeTask(await $fetch<CrmTask>(`${tasksBase}/${id}/start`, { method: 'PATCH' })),
    completeTask: async (id: string) =>
      normalizeTask(await $fetch<CrmTask>(`${tasksBase}/${id}/complete`, { method: 'PATCH' })),
    archiveTask: async (id: string) =>
      normalizeTask(await $fetch<CrmTask>(`${tasksBase}/${id}/archive`, { method: 'PATCH' })),
    reopenTask: async (id: string) =>
      normalizeTask(await $fetch<CrmTask>(`${tasksBase}/${id}/reopen`, { method: 'PATCH' })),

    listTaskRequests: async () =>
      normalizeTaskRequestList(await $fetch<CrmTaskRequest[]>(taskRequestsBase, { method: 'GET' })),
    listTaskTaskRequests: async (taskId: string) =>
      normalizeTaskRequestList(
        await $fetch<CrmTaskRequest[]>(`${tasksBase}/${taskId}/task-requests`, {
          method: 'GET',
        }),
      ),
    listTaskRequestsBySprintGroupedByTask: async (
      sprintId: string,
      userId?: string,
    ) =>
      normalizeTaskRequestResponse(
        await $fetch<CrmSprintTaskRequestsResponse>(
          `${taskRequestsBase}/sprints/${sprintId}/grouped-by-task`,
          {
            method: 'GET',
            query: userId ? { user: userId } : undefined,
          },
        ),
      ),
    assignTaskRequestRequester: async (id: string, requesterId: string) =>
      normalizeTaskRequest(
        await $fetch<CrmTaskRequest>(
          `${taskRequestsBase}/${id}/requester/${requesterId}`,
          { method: 'PATCH' },
        ),
      ),
    assignTaskRequestReviewer: async (id: string, reviewerId: string) =>
      normalizeTaskRequest(
        await $fetch<CrmTaskRequest>(
          `${taskRequestsBase}/${id}/reviewer/${reviewerId}`,
          { method: 'PATCH' },
        ),
      ),
    listUsers: () =>
      $fetch<CrmUser[] | { data?: CrmUser[]; items?: CrmUser[] }>('/api/user', {
        method: 'GET',
      }),
    createTaskRequest: async (payload: CreateTaskRequestPayload) =>
      normalizeTaskRequest(
        await $fetch<CrmTaskRequest>(taskRequestsBase, {
          method: 'POST',
          body: toTaskRequestPayload(payload),
        }),
      ),
    getTaskRequest: async (id: string) =>
      normalizeTaskRequest(
        await $fetch<CrmTaskRequest>(`${taskRequestsBase}/${id}`, { method: 'GET' }),
      ),
    updateTaskRequest: async (id: string, payload: UpdateTaskRequestPayload) =>
      normalizeTaskRequest(
        await $fetch<CrmTaskRequest>(`${taskRequestsBase}/${id}`, {
          method: 'PUT',
          body: toTaskRequestPayload(payload),
        }),
      ),
    patchTaskRequest: async (id: string, payload: PatchTaskRequestPayload) =>
      normalizeTaskRequest(
        await $fetch<CrmTaskRequest>(`${taskRequestsBase}/${id}`, {
          method: 'PATCH',
          body: toTaskRequestPayload(payload),
        }),
      ),
    patchTaskRequestRequestedStatus: async (id: string, status: CrmTaskStatus) =>
      normalizeTaskRequest(
        await $fetch<CrmTaskRequest>(
          `${taskRequestsBase}/${id}/requested-status/${status}`,
          { method: 'PATCH' },
        ),
      ),
    deleteTaskRequest: (id: string) =>
      $fetch<unknown>(`${taskRequestsBase}/${id}`, { method: 'DELETE' }),
    approveTaskRequest: async (id: string) =>
      normalizeTaskRequest(
        await $fetch<CrmTaskRequest>(`${taskRequestsBase}/${id}/approve`, {
          method: 'PATCH',
        }),
      ),
    rejectTaskRequest: async (id: string) =>
      normalizeTaskRequest(
        await $fetch<CrmTaskRequest>(`${taskRequestsBase}/${id}/reject`, {
          method: 'PATCH',
        }),
      ),
    cancelTaskRequest: async (id: string) =>
      normalizeTaskRequest(
        await $fetch<CrmTaskRequest>(`${taskRequestsBase}/${id}/cancel`, {
          method: 'PATCH',
        }),
      ),
  }
}

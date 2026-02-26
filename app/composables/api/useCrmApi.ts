export type CrmProjectStatus = 'active' | 'archived'
export type CrmTaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type CrmTaskStatus = 'todo' | 'in_progress' | 'done' | 'archived'
export type CrmTaskRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type CrmCompanyRole = 'owner' | 'member' | string

export type CrmCompany = {
  id: string
  name: string
  description?: string | null
  role?: CrmCompanyRole | null
  projectsCount?: number | null
  projects?: unknown[] | number | null
  stats?: {
    projectsCount?: number | null
  } | null
}

export type CrmProject = {
  id: string
  name: string
  description?: string | null
  status: CrmProjectStatus
}

export type CrmTask = {
  id: string
  title: string
  description?: string | null
  priority: CrmTaskPriority
  status: CrmTaskStatus
  dueDate?: string | null
  project?: { id?: string; name?: string } | null | []
}

export type CrmTaskRequest = {
  id: string
  task?: { id?: string } | string
  type: 'status_change'
  requestedStatus?: CrmTaskStatus | null
  status: CrmTaskRequestStatus
  note?: string | null
}

export type CreateCompanyPayload = {
  name: string
  description?: string
}

export type CreateProjectPayload = {
  name: string
  description?: string
  status?: CrmProjectStatus
}

export type UpdateProjectPayload = {
  name: string
  description?: string
  status: CrmProjectStatus
}

export type PatchProjectPayload = Partial<UpdateProjectPayload>

export type CreateTaskPayload = {
  title: string
  description?: string
  priority: CrmTaskPriority
  status: CrmTaskStatus
  project?: string | null
  dueDate?: string | null
}

export type UpdateTaskPayload = CreateTaskPayload
export type PatchTaskPayload = Partial<CreateTaskPayload>

export type CreateTaskRequestPayload = {
  task: string
  type: 'status_change'
  requestedStatus: CrmTaskStatus
  note?: string
}

export type UpdateTaskRequestPayload = CreateTaskRequestPayload & {
  status: CrmTaskRequestStatus
}

export type PatchTaskRequestPayload = Partial<UpdateTaskRequestPayload>

const companiesBase = '/api/v1/companies'
const projectsBase = '/api/v1/projects'
const tasksBase = '/api/v1/tasks'
const taskRequestsBase = '/api/v1/task-requests'

export function useCrmApi() {
  return {
    // Companies endpoints
    listCompanies: () => $fetch<CrmCompany[]>(companiesBase, { method: 'GET' }),
    createCompany: (payload: CreateCompanyPayload) =>
      $fetch<CrmCompany>(companiesBase, { method: 'POST', body: payload }),

    // Project endpoints
    listProjects: () => $fetch<CrmProject[]>(projectsBase, { method: 'GET' }),
    listCompanyProjects: (companyId: string) =>
      $fetch<CrmProject[]>(`${companiesBase}/${companyId}/projects`, {
        method: 'GET',
      }),
    createProject: (payload: CreateProjectPayload) => $fetch<CrmProject>(projectsBase, { method: 'POST', body: payload }),
    getProject: (id: string) => $fetch<CrmProject>(`${projectsBase}/${id}`, { method: 'GET' }),
    updateProject: (id: string, payload: UpdateProjectPayload) => $fetch<CrmProject>(`${projectsBase}/${id}`, { method: 'PUT', body: payload }),
    patchProject: (id: string, payload: PatchProjectPayload) => $fetch<CrmProject>(`${projectsBase}/${id}`, { method: 'PATCH', body: payload }),
    deleteProject: (id: string) => $fetch<unknown>(`${projectsBase}/${id}`, { method: 'DELETE' }),

    // Task endpoints
    listTasks: () => $fetch<CrmTask[]>(tasksBase, { method: 'GET' }),
    createTask: (payload: CreateTaskPayload) => $fetch<CrmTask>(tasksBase, { method: 'POST', body: payload }),
    getTask: (id: string) => $fetch<CrmTask>(`${tasksBase}/${id}`, { method: 'GET' }),
    updateTask: (id: string, payload: UpdateTaskPayload) => $fetch<CrmTask>(`${tasksBase}/${id}`, { method: 'PUT', body: payload }),
    patchTask: (id: string, payload: PatchTaskPayload) => $fetch<CrmTask>(`${tasksBase}/${id}`, { method: 'PATCH', body: payload }),
    deleteTask: (id: string) => $fetch<unknown>(`${tasksBase}/${id}`, { method: 'DELETE' }),
    startTask: (id: string) => $fetch<CrmTask>(`${tasksBase}/${id}/start`, { method: 'PATCH' }),
    completeTask: (id: string) => $fetch<CrmTask>(`${tasksBase}/${id}/complete`, { method: 'PATCH' }),
    archiveTask: (id: string) => $fetch<CrmTask>(`${tasksBase}/${id}/archive`, { method: 'PATCH' }),
    reopenTask: (id: string) => $fetch<CrmTask>(`${tasksBase}/${id}/reopen`, { method: 'PATCH' }),

    // Task request endpoints
    listTaskRequests: () => $fetch<CrmTaskRequest[]>(taskRequestsBase, { method: 'GET' }),
    createTaskRequest: (payload: CreateTaskRequestPayload) => $fetch<CrmTaskRequest>(taskRequestsBase, { method: 'POST', body: payload }),
    getTaskRequest: (id: string) => $fetch<CrmTaskRequest>(`${taskRequestsBase}/${id}`, { method: 'GET' }),
    updateTaskRequest: (id: string, payload: UpdateTaskRequestPayload) => $fetch<CrmTaskRequest>(`${taskRequestsBase}/${id}`, { method: 'PUT', body: payload }),
    patchTaskRequest: (id: string, payload: PatchTaskRequestPayload) => $fetch<CrmTaskRequest>(`${taskRequestsBase}/${id}`, { method: 'PATCH', body: payload }),
    deleteTaskRequest: (id: string) => $fetch<unknown>(`${taskRequestsBase}/${id}`, { method: 'DELETE' }),
    approveTaskRequest: (id: string) => $fetch<CrmTaskRequest>(`${taskRequestsBase}/${id}/approve`, { method: 'PATCH' }),
    rejectTaskRequest: (id: string) => $fetch<CrmTaskRequest>(`${taskRequestsBase}/${id}/reject`, { method: 'PATCH' }),
    cancelTaskRequest: (id: string) => $fetch<CrmTaskRequest>(`${taskRequestsBase}/${id}/cancel`, { method: 'PATCH' }),
  }
}

export type CrmProjectStatus = 'active' | 'archived'
export type CrmTaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type CrmTaskStatus = 'todo' | 'in_progress' | 'done' | 'archived'
export type CrmTaskRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
export type CrmCompanyRole = 'owner' | 'member' | string

export type CrmCompany = {
  id: string
  name: string
  legalName?: string | null
  description?: string | null
  role?: CrmCompanyRole | null
  photoUrl?: string | null
  photo?: string | null
  image?: string | null
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
  photoUrl?: string | null
  photo?: string | null
  image?: string | null
}

export type CrmSprint = {
  id: string
  name?: string | null
  status?: string | null
  goal?: string | null
  startDate?: string | null
  endDate?: string | null
  project?: { id?: string; name?: string } | string | null
}

export type CreateSprintPayload = {
  name: string
  project: string
  goal?: string
  status?: string
  startDate?: string
  endDate?: string
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
  time?: string | null
  requester?:
    | { id?: string; firstName?: string; lastName?: string; username?: string }
    | string
    | null
  reviewer?:
    | { id?: string; firstName?: string; lastName?: string; username?: string }
    | string
    | null
  requesterId?: string | null
  reviewerId?: string | null
}


export type CrmCompanyMember = {
  id: string
  username?: string
  firstName?: string
  lastName?: string
  email?: string
}

export type CrmUser = {
  id: string
  username?: string
  firstName?: string
  lastName?: string
  email?: string
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
const sprintsBase = '/api/v1/sprints'

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
    listCompanySprints: (companyId: string) =>
      $fetch<CrmSprint[]>(`${companiesBase}/${companyId}/sprints`, {
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

    // Sprint endpoints
    listSprints: () => $fetch<CrmSprint[]>(sprintsBase, { method: 'GET' }),
    createSprint: (payload: CreateSprintPayload) =>
      $fetch<CrmSprint>(sprintsBase, { method: 'POST', body: payload }),

    // Task endpoints
    listTasks: () => $fetch<CrmTask[]>(tasksBase, { method: 'GET' }),
    listProjectTasks: (projectId: string) =>
      $fetch<CrmTask[]>(`${projectsBase}/${projectId}/tasks`, {
        method: 'GET',
      }),
    createTask: (payload: CreateTaskPayload) =>
      $fetch<CrmTask>(tasksBase, { method: 'POST', body: payload }),
    getTask: (id: string) =>
      $fetch<CrmTask>(`${tasksBase}/${id}`, { method: 'GET' }),
    updateTask: (id: string, payload: UpdateTaskPayload) =>
      $fetch<CrmTask>(`${tasksBase}/${id}`, { method: 'PUT', body: payload }),
    patchTask: (id: string, payload: PatchTaskPayload) =>
      $fetch<CrmTask>(`${tasksBase}/${id}`, { method: 'PATCH', body: payload }),
    deleteTask: (id: string) =>
      $fetch<unknown>(`${tasksBase}/${id}`, { method: 'DELETE' }),
    startTask: (id: string) =>
      $fetch<CrmTask>(`${tasksBase}/${id}/start`, { method: 'PATCH' }),
    completeTask: (id: string) =>
      $fetch<CrmTask>(`${tasksBase}/${id}/complete`, { method: 'PATCH' }),
    archiveTask: (id: string) =>
      $fetch<CrmTask>(`${tasksBase}/${id}/archive`, { method: 'PATCH' }),
    reopenTask: (id: string) =>
      $fetch<CrmTask>(`${tasksBase}/${id}/reopen`, { method: 'PATCH' }),

    // Task request endpoints
    listTaskRequests: () =>
      $fetch<CrmTaskRequest[]>(taskRequestsBase, { method: 'GET' }),
    listTaskTaskRequests: (taskId: string) =>
      $fetch<CrmTaskRequest[]>(`${tasksBase}/${taskId}/task-requests`, {
        method: 'GET',
      }),
    listTaskRequestsBySprintGroupedByTask: (
      sprintId: string,
      userId?: string,
    ) =>
      $fetch<CrmSprintTaskRequestsResponse>(
        `${taskRequestsBase}/sprints/${sprintId}/grouped-by-task`,
        {
          method: 'GET',
          query: userId ? { user: userId } : undefined,
        },
      ),
    assignTaskRequestRequester: (id: string, requesterId: string) =>
      $fetch<CrmTaskRequest>(
        `${taskRequestsBase}/${id}/requester/${requesterId}`,
        { method: 'PATCH' },
      ),
    assignTaskRequestReviewer: (id: string, reviewerId: string) =>
      $fetch<CrmTaskRequest>(
        `${taskRequestsBase}/${id}/reviewer/${reviewerId}`,
        { method: 'PATCH' },
      ),
    listUsers: () =>
      $fetch<CrmUser[] | { data?: CrmUser[]; items?: CrmUser[] }>('/api/user', {
        method: 'GET',
      }),
    createTaskRequest: (payload: CreateTaskRequestPayload) =>
      $fetch<CrmTaskRequest>(taskRequestsBase, {
        method: 'POST',
        body: payload,
      }),
    getTaskRequest: (id: string) =>
      $fetch<CrmTaskRequest>(`${taskRequestsBase}/${id}`, { method: 'GET' }),
    updateTaskRequest: (id: string, payload: UpdateTaskRequestPayload) =>
      $fetch<CrmTaskRequest>(`${taskRequestsBase}/${id}`, {
        method: 'PUT',
        body: payload,
      }),
    patchTaskRequest: (id: string, payload: PatchTaskRequestPayload) =>
      $fetch<CrmTaskRequest>(`${taskRequestsBase}/${id}`, {
        method: 'PATCH',
        body: payload,
      }),
    patchTaskRequestRequestedStatus: (id: string, status: CrmTaskStatus) =>
      $fetch<CrmTaskRequest>(
        `${taskRequestsBase}/${id}/requested-status/${status}`,
        { method: 'PATCH' },
      ),
    deleteTaskRequest: (id: string) =>
      $fetch<unknown>(`${taskRequestsBase}/${id}`, { method: 'DELETE' }),
    approveTaskRequest: (id: string) =>
      $fetch<CrmTaskRequest>(`${taskRequestsBase}/${id}/approve`, {
        method: 'PATCH',
      }),
    rejectTaskRequest: (id: string) =>
      $fetch<CrmTaskRequest>(`${taskRequestsBase}/${id}/reject`, {
        method: 'PATCH',
      }),
    cancelTaskRequest: (id: string) =>
      $fetch<CrmTaskRequest>(`${taskRequestsBase}/${id}/cancel`, {
        method: 'PATCH',
      }),
  }
}

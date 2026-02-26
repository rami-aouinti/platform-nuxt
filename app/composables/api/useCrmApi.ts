export type CrmProject = {
  id: string
  name: string
  description?: string | null
  status?: string
}

export type CrmTask = {
  id: string
  title: string
  description?: string | null
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'todo' | 'in_progress' | 'done' | 'archived'
  dueDate?: string | null
  project?: { id?: string } | null | []
}

export type CreateCompanyPayload = {
  name: string
  description?: string
}

export type CreateProjectPayload = {
  name: string
  description?: string
  status?: 'active' | 'archived'
}

export type CreateTaskPayload = {
  title: string
  description?: string
  priority: CrmTask['priority']
  status: CrmTask['status']
  project?: string | null
  dueDate?: string | null
}

export type CreateTaskRequestPayload = {
  task: string
  type: 'status_change'
  requestedStatus: CrmTask['status']
  note?: string
}

export function useCrmApi() {
  return {
    createCompany: (payload: CreateCompanyPayload) => $fetch('/api/v1/companies', { method: 'POST', body: payload }),
    createProject: (payload: CreateProjectPayload) => $fetch('/api/v1/projects', { method: 'POST', body: payload }),
    createTask: (payload: CreateTaskPayload) => $fetch('/api/v1/tasks', { method: 'POST', body: payload }),
    createTaskRequest: (payload: CreateTaskRequestPayload) => $fetch('/api/v1/task-requests', { method: 'POST', body: payload }),
    listProjects: () => $fetch<CrmProject[]>('/api/v1/projects', { method: 'GET' }),
    listTasks: () => $fetch<CrmTask[]>('/api/v1/tasks', { method: 'GET' }),
  }
}

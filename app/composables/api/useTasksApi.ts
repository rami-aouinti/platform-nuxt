export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'archived'

export type TaskItem = {
  id: string
  owner: unknown
  project: unknown | null
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string | null
  completedAt: string | null
}

export type CreateTaskPayload = {
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  project?: string | null
  dueDate?: string
}

export type UpdateTaskPayload = CreateTaskPayload
export type PatchTaskPayload = Partial<CreateTaskPayload>

const basePath = '/api/v1/tasks'

export function useTasksApi() {
  return {
    list: () => $fetch<TaskItem[]>(basePath, { method: 'GET' }),
    get: (id: string) => $fetch<TaskItem>(`${basePath}/${id}`, { method: 'GET' }),
    create: (payload: CreateTaskPayload) => $fetch<TaskItem>(basePath, { method: 'POST', body: payload }),
    update: (id: string, payload: UpdateTaskPayload) => $fetch<TaskItem>(`${basePath}/${id}`, { method: 'PUT', body: payload }),
    patch: (id: string, payload: PatchTaskPayload) => $fetch<TaskItem>(`${basePath}/${id}`, { method: 'PATCH', body: payload }),
    delete: (id: string) => $fetch<unknown>(`${basePath}/${id}`, { method: 'DELETE' }),
    start: (id: string) => $fetch<TaskItem>(`${basePath}/${id}/start`, { method: 'PATCH' }),
    complete: (id: string) => $fetch<TaskItem>(`${basePath}/${id}/complete`, { method: 'PATCH' }),
    archive: (id: string) => $fetch<TaskItem>(`${basePath}/${id}/archive`, { method: 'PATCH' }),
    reopen: (id: string) => $fetch<TaskItem>(`${basePath}/${id}/reopen`, { method: 'PATCH' }),
  }
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'archived'

export function useTasksApi() {
  const basePath = '/api/v1/tasks'

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

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

export function useTasksApi() {
  function list() {
    return $fetch<TaskItem[]>('/api/v1/tasks', {
      method: 'GET',
    })
  }

  return {
    list,
  }
}

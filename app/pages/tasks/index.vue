<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { HttpRequestError } from '../../../services/http/client'
import type { Task } from '~/types/task-manager'
import { useTasksApi } from "~/composables/api/useTasksApi"

definePageMeta({
  icon: 'mdi-format-list-checks',
  title: 'Tasks',
  drawerIndex: 6,
  requiresAuth: true,
})

const tasksApi = useTasksApi()

const loading = ref(false)
const error = ref<string | null>(null)
const tasks = ref<Task[]>([])

function toErrorMessage(errorValue: unknown) {
  if (errorValue instanceof HttpRequestError) return errorValue.message
  if (errorValue instanceof Error) return errorValue.message
  return 'Impossible de charger les tasks.'
}

async function loadTasks() {
  loading.value = true
  error.value = null

  try {
    const response = await tasksApi.list()
    tasks.value = response.data
  } catch (errorValue) {
    error.value = toErrorMessage(errorValue)
    Notify.error(error.value)
  } finally {
    loading.value = false
  }
}

onMounted(loadTasks)
</script>

<template>
  <TaskBoardAndTable />
</template>

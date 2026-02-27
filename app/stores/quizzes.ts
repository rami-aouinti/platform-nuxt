import { useQuizzesApi } from '~/composables/api/useQuizzesApi'
import type { Id } from '~/composables/api/httpUiErrors'
import { Notify } from '~/stores/notification'
import type { Quiz, QuizPayload } from '~/types/quiz'
import { toUiErrorMessage } from '~/utils/errors/toUiErrorMessage'


function normalizeList(payload: unknown): Quiz[] {
  if (Array.isArray(payload)) return payload as Quiz[]
  if (payload && typeof payload === 'object' && 'data' in payload && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: Quiz[] }).data
  }
  if (payload && typeof payload === 'object' && 'items' in payload && Array.isArray((payload as { items?: unknown }).items)) {
    return (payload as { items: Quiz[] }).items
  }
  return []
}

export const useQuizzesStore = defineStore('quizzes', () => {
  const api = useQuizzesApi()

  const rows = ref<Quiz[]>([])
  const item = ref<Quiz | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function mergeRow(next: Quiz) {
    rows.value = rows.value.map((row) => (row.id === next.id ? next : row))
    if (!rows.value.some((row) => row.id === next.id)) rows.value = [next, ...rows.value]
    if (item.value?.id === next.id) item.value = next
  }

  async function fetchRows() {
    loading.value = true
    error.value = null
    try {
      const response = await api.list()
      rows.value = normalizeList(response)
      return rows.value
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function fetchItem(id: Id) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(id)
      item.value = response
      mergeRow(response)
      return response
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function create(payload: QuizPayload) {
    loading.value = true
    error.value = null
    try {
      const created = await api.create(payload)
      mergeRow(created)
      Notify.success('Quiz créé avec succès.')
      await fetchRows()
      return created
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function update(id: Id, payload: QuizPayload) {
    loading.value = true
    error.value = null
    try {
      const updated = await api.update(id, payload)
      mergeRow(updated)
      Notify.success('Quiz mis à jour.')
      await fetchRows()
      return updated
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function remove(id: Id) {
    loading.value = true
    error.value = null
    try {
      await api.delete(id)
      rows.value = rows.value.filter((row) => row.id !== id)
      if (item.value?.id === id) item.value = null
      Notify.success('Quiz supprimé.')
      await fetchRows()
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  return {
    rows,
    item,
    loading,
    error,
    fetchRows,
    fetchItem,
    create,
    update,
    remove,
  }
})

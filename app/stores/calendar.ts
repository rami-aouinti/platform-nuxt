import { useCalendarApi } from '~/composables/api/useCalendarApi'
import { resolvePaginatedTotal, type Id } from '~/composables/api/httpUiErrors'
import { Notify } from '~/stores/notification'
import type { CalendarEvent, CalendarEventPayload } from '~/types/calendar'

function toErrorMessage(errorValue: unknown) {
  if (errorValue && typeof errorValue === 'object' && 'message' in errorValue && typeof errorValue.message === 'string') {
    return errorValue.message
  }
  if (errorValue instanceof Error) return errorValue.message
  return 'Une erreur est survenue.'
}

export const useCalendarStore = defineStore('calendar', () => {
  const api = useCalendarApi()

  const rows = ref<CalendarEvent[]>([])
  const item = ref<CalendarEvent | null>(null)
  const pagination = ref({ total: 0 })
  const loading = ref(false)
  const error = ref<string | null>(null)

  function mergeRow(next: CalendarEvent) {
    rows.value = rows.value.map((row) => (row.id === next.id ? next : row))
    if (!rows.value.some((row) => row.id === next.id)) rows.value = [next, ...rows.value]
    if (item.value?.id === next.id) item.value = next
  }

  async function fetchRows() {
    loading.value = true
    error.value = null
    try {
      const response = await api.list()
      rows.value = response.data
      pagination.value.total = resolvePaginatedTotal(response.meta?.total, response.data.length)
      return rows.value
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
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
      error.value = toErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function create(payload: CalendarEventPayload) {
    loading.value = true
    error.value = null
    try {
      const created = await api.create(payload)
      mergeRow(created)
      Notify.success('Événement créé avec succès.')
      await fetchRows()
      return created
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function update(id: Id, payload: CalendarEventPayload) {
    loading.value = true
    error.value = null
    try {
      const updated = await api.update(id, payload)
      mergeRow(updated)
      Notify.success('Événement mis à jour.')
      await fetchRows()
      return updated
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }


  async function patch(id: Id, payload: Partial<CalendarEventPayload>) {
    loading.value = true
    error.value = null
    try {
      const updated = await api.patch(id, payload)
      mergeRow(updated)
      Notify.success('Événement mis à jour.')
      await fetchRows()
      return updated
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
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
      Notify.success('Événement supprimé.')
      await fetchRows()
    } catch (errorValue) {
      error.value = toErrorMessage(errorValue)
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
    pagination,
    fetchRows,
    fetchItem,
    create,
    update,
    patch,
    remove,
  }
})

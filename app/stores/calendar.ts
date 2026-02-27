import { useCalendarApi } from '~/composables/api/useCalendarApi'
import type { Id } from '~/composables/api/httpUiErrors'
import { Notify } from '~/stores/notification'
import type { CalendarEvent, CalendarEventPayload } from '~/types/calendar'

function toErrorMessage(errorValue: unknown) {
  if (errorValue && typeof errorValue === 'object' && 'message' in errorValue && typeof errorValue.message === 'string') {
    return errorValue.message
  }
  if (errorValue instanceof Error) return errorValue.message
  return 'Une erreur est survenue.'
}

function normalizeList(payload: unknown): CalendarEvent[] {
  if (Array.isArray(payload)) return payload as CalendarEvent[]
  if (payload && typeof payload === 'object' && 'data' in payload && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: CalendarEvent[] }).data
  }
  if (payload && typeof payload === 'object' && 'items' in payload && Array.isArray((payload as { items?: unknown }).items)) {
    return (payload as { items: CalendarEvent[] }).items
  }
  return []
}

export const useCalendarStore = defineStore('calendar', () => {
  const api = useCalendarApi()

  const rows = ref<CalendarEvent[]>([])
  const item = ref<CalendarEvent | null>(null)
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
      rows.value = normalizeList(response)
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
    fetchRows,
    fetchItem,
    create,
    update,
    remove,
  }
})

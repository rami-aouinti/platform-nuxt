import { useCalendarApi } from '~/composables/api/useCalendarApi'
import { resolvePaginatedTotal, type Id } from '~/composables/api/httpUiErrors'
import { Notify } from '~/stores/notification'
import type { CalendarEvent, CalendarEventPayload } from '~/types/calendar'
import { toUiErrorMessage } from '~/utils/errors/toUiErrorMessage'
import { readSessionCache, writeSessionCache } from '~/utils/session-cache'

const CALENDAR_EVENTS_CACHE_KEY = 'calendar_events'
const CALENDAR_EVENTS_CACHE_MAX_AGE_MS = 5 * 60 * 1000

export const useCalendarStore = defineStore('calendar', () => {
  const t = (key: string, params?: Record<string, unknown>) => String(useNuxtApp().$i18n.t(key, params))

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

  async function fetchRows(options: { force?: boolean } = {}) {
    const shouldUseCache = !options.force

    if (shouldUseCache) {
      const cachedRows = readSessionCache<CalendarEvent[]>(
        CALENDAR_EVENTS_CACHE_KEY,
        CALENDAR_EVENTS_CACHE_MAX_AGE_MS,
      )

      if (cachedRows) {
        rows.value = cachedRows
        pagination.value.total = cachedRows.length
        return rows.value
      }
    }

    loading.value = true
    error.value = null
    try {
      const response = await api.list()
      rows.value = response.data
      pagination.value.total = resolvePaginatedTotal(response.meta?.total, response.data.length)
      writeSessionCache(CALENDAR_EVENTS_CACHE_KEY, rows.value)
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

  async function create(payload: CalendarEventPayload) {
    loading.value = true
    error.value = null
    try {
      const created = await api.create(payload)
      mergeRow(created)
      writeSessionCache(CALENDAR_EVENTS_CACHE_KEY, rows.value)
      Notify.success(t('notifications.calendar.created'))
      await fetchRows({ force: true })
      return created
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
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
      writeSessionCache(CALENDAR_EVENTS_CACHE_KEY, rows.value)
      Notify.success(t('notifications.calendar.updated'))
      await fetchRows({ force: true })
      return updated
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
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
      writeSessionCache(CALENDAR_EVENTS_CACHE_KEY, rows.value)
      Notify.success(t('notifications.calendar.updated'))
      await fetchRows({ force: true })
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
      writeSessionCache(CALENDAR_EVENTS_CACHE_KEY, rows.value)
      Notify.success(t('notifications.calendar.deleted'))
      await fetchRows({ force: true })
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
    pagination,
    fetchRows,
    fetchItem,
    create,
    update,
    patch,
    remove,
  }
})

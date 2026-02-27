import { apiRequest, type ApiListQuery, type Id, type PaginatedResponse } from './httpUiErrors'
import type { CalendarEvent, CalendarEventPayload } from '~/types/calendar'

export function useCalendarApi() {
  const basePath = '/api/v1/calendar/events'

  return {
    list: (query?: ApiListQuery) => apiRequest<PaginatedResponse<CalendarEvent> | CalendarEvent[]>('GET', basePath, { query }),
    get: (id: Id) => apiRequest<CalendarEvent>('GET', `${basePath}/${id}`),
    create: (payload: CalendarEventPayload) => apiRequest<CalendarEvent>('POST', basePath, { body: payload }),
    update: (id: Id, payload: CalendarEventPayload) => apiRequest<CalendarEvent>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: Partial<CalendarEventPayload>) => apiRequest<CalendarEvent>('PATCH', `${basePath}/${id}`, { body: payload }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),
  }
}

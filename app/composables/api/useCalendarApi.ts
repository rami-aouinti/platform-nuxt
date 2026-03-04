import {
  apiRequest,
  normalizePaginatedResponse,
  type ApiListQuery,
  type ApiListResponse,
  type Id,
} from './httpUiErrors'
import type { CalendarEvent, CalendarEventPayload } from '~/types/calendar'

export function useCalendarApi() {
  const basePath = '/api/v1/me/calendar/events'

  return {
    list: async (query?: ApiListQuery) =>
      normalizePaginatedResponse(
        await apiRequest<ApiListResponse<CalendarEvent>>('GET', basePath, {
          query,
        }),
      ),
    get: (id: Id) => apiRequest<CalendarEvent>('GET', `${basePath}/${id}`),
    create: (payload: CalendarEventPayload) =>
      apiRequest<CalendarEvent>('POST', basePath, { body: payload }),
    update: (id: Id, payload: CalendarEventPayload) =>
      apiRequest<CalendarEvent>('PUT', `${basePath}/${id}`, { body: payload }),
    patch: (id: Id, payload: Partial<CalendarEventPayload>) =>
      apiRequest<CalendarEvent>('PATCH', `${basePath}/${id}`, {
        body: payload,
      }),
    delete: (id: Id) => apiRequest<unknown>('DELETE', `${basePath}/${id}`),
  }
}

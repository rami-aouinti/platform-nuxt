import { httpDelete, httpGet, httpPatch, httpPost, httpPut } from '../http/client'
import type {
  CountResponse,
  Id,
  PaginatedResponse,
  PaginationQuery,
  PatchPayload,
} from './_shared'

const NOTIFICATIONS_BASE_PATH = '/api/v1/admin/notifications'

export interface Notification {
  id: Id
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read?: boolean
  createdAt?: string
}

export interface CreateNotificationRequest {
  title: string
  message: string
  type: Notification['type']
}

export interface UpdateNotificationRequest {
  title?: string
  message?: string
  type?: Notification['type']
  read?: boolean
}

export type PatchNotificationRequest = PatchPayload

export const notificationsService = {
  list(query: PaginationQuery = {}) {
    return httpGet<PaginatedResponse<Notification>>(NOTIFICATIONS_BASE_PATH, { query })
  },
  count() {
    return httpGet<CountResponse>(`${NOTIFICATIONS_BASE_PATH}/count`)
  },
  ids() {
    return httpGet<Id[]>(`${NOTIFICATIONS_BASE_PATH}/ids`)
  },
  getById(id: Id) {
    return httpGet<Notification>(`${NOTIFICATIONS_BASE_PATH}/${id}`)
  },
  create(payload: CreateNotificationRequest) {
    return httpPost<Notification, CreateNotificationRequest>(NOTIFICATIONS_BASE_PATH, payload)
  },
  update(id: Id, payload: UpdateNotificationRequest) {
    return httpPut<Notification, UpdateNotificationRequest>(`${NOTIFICATIONS_BASE_PATH}/${id}`, payload)
  },
  patch(id: Id, payload: PatchNotificationRequest) {
    return httpPatch<Notification, PatchNotificationRequest>(`${NOTIFICATIONS_BASE_PATH}/${id}`, payload)
  },
  remove(id: Id) {
    return httpDelete<unknown>(`${NOTIFICATIONS_BASE_PATH}/${id}`)
  },
}

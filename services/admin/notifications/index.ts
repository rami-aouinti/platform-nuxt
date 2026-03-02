import { createAdminCrudService, type Id, type PatchPayload } from '../shared/index'

import { adminEndpoints } from '../endpoints'

const NOTIFICATIONS_BASE_PATH = adminEndpoints.notifications.base

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

export const notificationsService = createAdminCrudService<
  Notification,
  CreateNotificationRequest,
  UpdateNotificationRequest,
  PatchNotificationRequest
>(NOTIFICATIONS_BASE_PATH)

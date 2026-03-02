import { useNotificationStore } from '~/stores/notification'

export type CrudAction = 'fetch' | 'create' | 'update' | 'patch' | 'remove'

function translate(key: string, params?: Record<string, unknown>) {
  return String(useNuxtApp().$i18n.t(key, params))
}

const actionSuccessMessage: Record<CrudAction, string> = {
  fetch: 'notifications.actions.fetch',
  create: 'notifications.actions.create',
  update: 'notifications.actions.update',
  patch: 'notifications.actions.patch',
  remove: 'notifications.actions.remove',
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return translate('notifications.errorFallback')
}

export function notifyCrudSuccess(entityLabel: string, action: CrudAction) {
  useNotificationStore().addNotification(
    translate('notifications.crudSuccess', {
      entity: entityLabel,
      action: translate(actionSuccessMessage[action]),
    }),
    'success',
  )
}

export function notifyCrudError(entityLabel: string, action: CrudAction, error: unknown) {
  useNotificationStore().addNotification(
    translate('notifications.crudError', {
      entity: entityLabel.toLowerCase(),
      action,
      error: getErrorMessage(error),
    }),
    'error',
  )
}

export function notifyFormValidationError(entityLabel: string) {
  useNotificationStore().addNotification(
    translate('notifications.formValidationError', { entity: entityLabel }),
    'error',
  )
}

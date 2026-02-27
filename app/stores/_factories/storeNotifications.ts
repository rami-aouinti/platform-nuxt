import { useNotificationStore } from '~/stores/notification'

export type CrudAction = 'fetch' | 'create' | 'update' | 'patch' | 'remove'

const actionSuccessMessage: Record<CrudAction, string> = {
  fetch: 'chargée',
  create: 'créée',
  update: 'mise à jour',
  patch: 'modifiée',
  remove: 'supprimée',
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Une erreur est survenue.'
}

export function notifyCrudSuccess(entityLabel: string, action: CrudAction) {
  useNotificationStore().addNotification(`${entityLabel} ${actionSuccessMessage[action]} avec succès.`, 'success')
}

export function notifyCrudError(entityLabel: string, action: CrudAction, error: unknown) {
  useNotificationStore().addNotification(`Échec ${entityLabel.toLowerCase()} (${action}) : ${getErrorMessage(error)}`, 'error')
}

export function notifyFormValidationError(entityLabel: string) {
  useNotificationStore().addNotification(`${entityLabel} contient des erreurs. Merci de les corriger.`, 'error')
}

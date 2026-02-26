export const FORBIDDEN_MESSAGE =
  'Accès refusé : vous n’avez pas les permissions nécessaires pour cette action.'

export const PERMISSION_MESSAGES = {
  manageProject: 'Action interdite : vous ne pouvez pas gérer ce projet.',
  createProject: 'Action interdite : vous ne pouvez pas créer de projet dans cette company.',
  manageTask: 'Action interdite : vous ne pouvez pas modifier cette tâche.',
  createTask: 'Action interdite : vous ne pouvez pas créer de tâche sur ce projet.',
  createTaskRequest: 'Action interdite : vous ne pouvez pas créer cette demande.',
  updateTaskRequest: 'Action interdite : vous ne pouvez pas modifier cette demande.',
  updateTaskRequestStatus: 'Action interdite : vous ne pouvez pas changer le statut de cette demande.',
  cancelTaskRequest: 'Action interdite : vous ne pouvez pas annuler cette demande.',
  forbiddenPatch: 'Action refusée (403). Aucun changement appliqué.',
  forbiddenDelete: 'Action refusée (403). La suppression a été annulée.',
  forbiddenTaskRequestStatus: 'Action refusée (403). Le statut de la demande est inchangé.',
} as const

export function toForbiddenMessage(statusCode?: number | null) {
  if (statusCode === 403) {
    return FORBIDDEN_MESSAGE
  }

  return null
}

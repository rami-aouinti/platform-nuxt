export const FORBIDDEN_MESSAGE =
  'Accès refusé : vous n’avez pas les permissions nécessaires pour cette action.'

export function toForbiddenMessage(statusCode?: number | null) {
  if (statusCode === 403) {
    return FORBIDDEN_MESSAGE
  }

  return null
}

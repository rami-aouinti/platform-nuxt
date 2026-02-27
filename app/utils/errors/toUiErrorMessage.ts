import { toUiApiError, type UiApiError } from '~/composables/api/httpUiErrors'

function normalizeUiApiError(errorValue: unknown): UiApiError {
  if (errorValue && typeof errorValue === 'object' && 'statusCode' in errorValue && 'message' in errorValue && 'fieldErrors' in errorValue) {
    return errorValue as UiApiError
  }

  return toUiApiError(errorValue)
}

export function toUiFieldErrors(errorValue: unknown): Record<string, string[]> {
  return normalizeUiApiError(errorValue).fieldErrors
}

export function toUiErrorMessage(errorValue: unknown): string {
  const uiError = normalizeUiApiError(errorValue)

  if (uiError.type === 'validation') {
    const fieldMessages = Object.entries(uiError.fieldErrors)
      .filter(([, messages]) => messages.length > 0)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)

    if (fieldMessages.length > 0) {
      return fieldMessages.join(' · ')
    }
  }

  return uiError.message
}

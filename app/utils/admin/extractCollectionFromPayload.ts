export function extractCollectionFromPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload
  }

  if (!payload || typeof payload !== 'object') {
    return []
  }

  if (Array.isArray((payload as { items?: unknown[] }).items)) {
    return (payload as { items: unknown[] }).items
  }

  if (Array.isArray((payload as { data?: unknown[] }).data)) {
    return (payload as { data: unknown[] }).data
  }

  return []
}

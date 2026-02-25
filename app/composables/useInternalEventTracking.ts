export interface InternalTrackingEvent {
  name: string
  payload?: Record<string, unknown>
}

export function useInternalEventTracking() {
  function track(event: InternalTrackingEvent) {
    if (import.meta.client) {
      window.dispatchEvent(
        new CustomEvent('internal-tracking', {
          detail: {
            ...event,
            timestamp: new Date().toISOString(),
          },
        }),
      )
    }

    console.info('[internal-tracking]', event.name, event.payload ?? {})
  }

  return {
    track,
  }
}

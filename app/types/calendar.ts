export interface CalendarAttendee {
  name: string
  email: string
}

export interface CalendarReminder {
  type: 'email' | 'popup' | string
  minutesBefore: number
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string | null
  location?: string | null
  startAt: string
  endAt: string
  isAllDay: boolean
  timezone?: string | null
  status?: string | null
  visibility?: string | null
  isCancelled?: boolean
  color?: string | null
  backgroundColor?: string | null
  borderColor?: string | null
  textColor?: string | null
  organizerName?: string | null
  organizerEmail?: string | null
  attendees?: CalendarAttendee[]
  reminders?: CalendarReminder[]
  metadata?: Record<string, unknown> | null
}

export interface CalendarEventPayload {
  title: string
  description?: string | null
  location?: string | null
  startAt: string
  endAt: string
  isAllDay?: boolean
  timezone?: string | null
  status?: string | null
  visibility?: string | null
  isCancelled?: boolean
  attendees?: CalendarAttendee[]
  reminders?: CalendarReminder[]
  metadata?: Record<string, unknown>
}

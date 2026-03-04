<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { CalendarEvent, CalendarEventPayload } from '~/types/calendar'
import { useCalendarStore } from '~/stores/calendar'

interface FullCalendarEventInput {
  id: string
  title: string
  start: string
  end?: string
  allDay?: boolean
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  extendedProps?: {
    status?: string | null
  }
}

interface FullCalendarInstance {
  render: () => void
  destroy: () => void
  removeAllEvents: () => void
  addEventSource: (events: FullCalendarEventInput[]) => void
}

interface FullCalendarEventApi {
  id: string
  startStr: string
  endStr?: string
  allDay: boolean
}

interface FullCalendarEventChangeArg {
  event: FullCalendarEventApi
  revert: () => void
}

interface FullCalendarDateClickArg {
  dateStr: string
  allDay: boolean
}

type FullCalendarCtor = new (
  element: HTMLElement,
  options: {
    initialView: string
    locale?: string
    height?: string
    headerToolbar?: Record<string, string>
    events?: FullCalendarEventInput[]
    editable?: boolean
    eventDurationEditable?: boolean
    eventStartEditable?: boolean
    eventClick?: (arg: { event: { id: string } }) => void
    eventDrop?: (arg: FullCalendarEventChangeArg) => void
    eventResize?: (arg: FullCalendarEventChangeArg) => void
    dateClick?: (arg: FullCalendarDateClickArg) => void
  },
) => FullCalendarInstance

declare global {
  interface Window {
    FullCalendar?: {
      Calendar: FullCalendarCtor
    }
  }
}

const FULL_CALENDAR_SCRIPT_ID = 'fullcalendar-global-script'
const FULL_CALENDAR_SCRIPT_SRC = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.19/index.global.min.js'

let fullCalendarScriptPromise: Promise<void> | null = null

function ensureFullCalendarLoaded() {
  if (window.FullCalendar?.Calendar) return Promise.resolve()

  if (fullCalendarScriptPromise) return fullCalendarScriptPromise

  fullCalendarScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(FULL_CALENDAR_SCRIPT_ID) as HTMLScriptElement | null

    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Impossible de charger FullCalendar.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = FULL_CALENDAR_SCRIPT_ID
    script.src = FULL_CALENDAR_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Impossible de charger FullCalendar.'))

    document.head.appendChild(script)
  })

  return fullCalendarScriptPromise
}

const calendarStore = useCalendarStore()
const { rows: events, loading, error: storeError } = storeToRefs(calendarStore)

const errorMessage = ref('')
const saving = ref(false)
const deletingId = ref<string | null>(null)
const isDialogOpen = ref(false)
const editingId = ref<string | null>(null)

const formatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const calendarRoot = ref<HTMLElement | null>(null)
const calendarInstance = ref<FullCalendarInstance | null>(null)

const form = reactive<CalendarEventPayload>({
  title: '',
  description: '',
  location: '',
  startAt: '',
  endAt: '',
  isAllDay: false,
  timezone: 'Europe/Paris',
  status: 'confirmed',
  visibility: 'private',
})

const isFormValid = computed(() => Boolean(form.title.trim()) && Boolean(form.startAt) && Boolean(form.endAt))

function toDateTimeLocalInput(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''

  const pad = (part: number) => String(part).padStart(2, '0')
  const year = parsed.getFullYear()
  const month = pad(parsed.getMonth() + 1)
  const day = pad(parsed.getDate())
  const hours = pad(parsed.getHours())
  const minutes = pad(parsed.getMinutes())

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function toIsoDateTime(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toISOString()
}

const calendarEventSource = computed<FullCalendarEventInput[]>(() => events.value.map((eventItem) => ({
  id: eventItem.id,
  title: eventItem.title,
  start: eventItem.startAt,
  end: eventItem.endAt,
  allDay: eventItem.isAllDay,
  backgroundColor: eventItem.backgroundColor ?? undefined,
  borderColor: eventItem.borderColor ?? undefined,
  textColor: eventItem.textColor ?? undefined,
  extendedProps: { status: eventItem.status },
})))

const todaysEvents = computed(() => {
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  return events.value.filter((eventItem) => {
    const startAt = new Date(eventItem.startAt)
    return startAt >= startOfDay && startAt <= endOfDay
  })
})

function formatEventDate(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return formatter.format(parsed)
}

function syncCalendarEvents() {
  if (!calendarInstance.value) return
  calendarInstance.value.removeAllEvents()
  calendarInstance.value.addEventSource(calendarEventSource.value)
}

function resetForm() {
  form.title = ''
  form.description = ''
  form.location = ''
  form.startAt = ''
  form.endAt = ''
  form.isAllDay = false
  form.timezone = 'Europe/Paris'
  form.status = 'confirmed'
  form.visibility = 'private'
}

function toDraggedPayload(event: FullCalendarEventApi): Partial<CalendarEventPayload> {
  return {
    startAt: event.startStr,
    ...(event.endStr ? { endAt: event.endStr } : {}),
    isAllDay: event.allDay,
  }
}

async function handleEventDateChange({ event, revert }: FullCalendarEventChangeArg) {
  errorMessage.value = ''

  try {
    await calendarStore.patch(event.id, toDraggedPayload(event))
  } catch {
    revert()
    errorMessage.value = storeError.value ?? 'Impossible de déplacer ou redimensionner l\'événement.'
  }
}

function openCreateDialog() {
  editingId.value = null
  resetForm()
  isDialogOpen.value = true
}

function toDateAtHour(value: string, hour: number) {
  const baseDate = value.length === 10 ? new Date(`${value}T00:00`) : new Date(value)
  if (Number.isNaN(baseDate.getTime())) return ''
  baseDate.setHours(hour, 0, 0, 0)
  return toDateTimeLocalInput(baseDate.toISOString())
}

function openCreateDialogForDay(dateValue: string) {
  openCreateDialog()

  const startAt = toDateAtHour(dateValue, 9)
  const endAt = toDateAtHour(dateValue, 10)

  if (startAt) form.startAt = startAt
  if (endAt) form.endAt = endAt
}

function openEditDialog(eventItem: CalendarEvent) {
  editingId.value = eventItem.id
  form.title = eventItem.title
  form.description = eventItem.description ?? ''
  form.location = eventItem.location ?? ''
  form.startAt = toDateTimeLocalInput(eventItem.startAt)
  form.endAt = toDateTimeLocalInput(eventItem.endAt)
  form.isAllDay = Boolean(eventItem.isAllDay)
  form.timezone = eventItem.timezone ?? 'Europe/Paris'
  form.status = eventItem.status ?? 'confirmed'
  form.visibility = eventItem.visibility ?? 'private'
  isDialogOpen.value = true
}

async function initCalendar() {
  if (!calendarRoot.value) return

  await ensureFullCalendarLoaded()

  const Calendar = window.FullCalendar?.Calendar
  if (!Calendar) throw new Error('FullCalendar non disponible.')

  calendarInstance.value = new Calendar(calendarRoot.value, {
    initialView: 'dayGridMonth',
    locale: 'en',
    height: '72vh',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    editable: true,
    eventDurationEditable: true,
    eventStartEditable: true,
    events: calendarEventSource.value,
    eventClick: ({ event }) => {
      const eventItem = events.value.find((row) => row.id === event.id)
      if (eventItem) openEditDialog(eventItem)
    },
    eventDrop: handleEventDateChange,
    eventResize: handleEventDateChange,
    dateClick: ({ dateStr }) => {
      openCreateDialogForDay(dateStr)
    },
  })

  calendarInstance.value.render()
}

async function loadEvents() {
  errorMessage.value = ''
  try {
    await calendarStore.fetchRows()
  } catch {
    errorMessage.value = storeError.value ?? 'Impossible de charger les événements.'
  }
}

async function saveEvent() {
  if (!isFormValid.value) {
    errorMessage.value = 'Le titre, la date de début et la date de fin sont obligatoires.'
    return
  }

  saving.value = true
  errorMessage.value = ''

  const payload: CalendarEventPayload = {
    ...form,
    title: form.title.trim(),
    startAt: toIsoDateTime(form.startAt),
    endAt: toIsoDateTime(form.endAt),
  }

  try {
    if (editingId.value) {
      await calendarStore.update(editingId.value, payload)
    } else {
      await calendarStore.create(payload)
    }

    isDialogOpen.value = false
  } catch {
    errorMessage.value = storeError.value ?? 'Impossible d\'enregistrer l\'événement.'
  } finally {
    saving.value = false
  }
}

async function deleteEvent(id: string) {
  deletingId.value = id
  errorMessage.value = ''

  try {
    await calendarStore.remove(id)
  } catch {
    errorMessage.value = storeError.value ?? 'Impossible de supprimer l\'événement.'
  } finally {
    deletingId.value = null
  }
}

watch(calendarEventSource, () => {
  syncCalendarEvents()
}, { deep: true })

onMounted(async () => {
  await loadEvents()

  try {
    await initCalendar()
  } catch (errorValue) {
    errorMessage.value = errorValue instanceof Error ? errorValue.message : 'Impossible d\'initialiser le calendrier.'
  }
})

onBeforeUnmount(() => {
  calendarInstance.value?.destroy()
  calendarInstance.value = null
})
</script>

<template>
  <div>
    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <v-row>
      <v-col cols="12" md="3">
        <v-card class="mb-4">
          <v-card-title class="text-h6">Actions</v-card-title>
          <v-card-text>
            <v-btn block color="primary" @click="openCreateDialog">Créer un nouvel événement</v-btn>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title class="text-h6">Événements d'aujourd'hui</v-card-title>
          <v-card-text>
            <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

            <v-list v-else-if="todaysEvents.length" lines="two" density="comfortable">
              <v-list-item v-for="eventItem in todaysEvents" :key="eventItem.id" class="px-0">
                <v-list-item-title>{{ eventItem.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ formatEventDate(eventItem.startAt) }}</v-list-item-subtitle>

                <template #append>
                  <div class="d-flex ga-2">
                    <v-btn size="x-small" variant="tonal" @click="openEditDialog(eventItem)">Éditer</v-btn>
                    <v-btn
                      size="x-small"
                      color="error"
                      variant="tonal"
                      :loading="deletingId === eventItem.id"
                      @click="deleteEvent(eventItem.id)"
                    >
                      Supprimer
                    </v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-list>

            <p v-else class="text-medium-emphasis mb-0">Aucun événement prévu aujourd'hui.</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <v-card>
          <v-card-text>
            <div ref="calendarRoot" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="isDialogOpen" max-width="720">
      <v-card>
        <v-card-title>{{ editingId ? 'Modifier un événement' : 'Créer un événement' }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="form.title" label="Titre" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="form.description" label="Description" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.startAt" type="datetime-local" label="Début" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.endAt" type="datetime-local" label="Fin" required />
            </v-col>
            <v-col cols="12">
              <v-expansion-panels variant="accordion">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    Options avancées
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field v-model="form.location" label="Lieu" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field v-model="form.timezone" label="Timezone" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field v-model="form.status" label="Statut" />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field v-model="form.visibility" label="Visibilité" />
                      </v-col>
                      <v-col cols="12">
                        <v-switch v-model="form.isAllDay" label="Toute la journée" />
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="isDialogOpen = false">Annuler</v-btn>
          <v-btn color="primary" :loading="saving" :disabled="!isFormValid" @click="saveEvent">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

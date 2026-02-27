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

const headers = [
  { title: 'Titre', key: 'title' },
  { title: 'Début', key: 'startAt' },
  { title: 'Fin', key: 'endAt' },
  { title: 'Statut', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]

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

function openEditDialog(eventItem: CalendarEvent) {
  editingId.value = eventItem.id
  form.title = eventItem.title
  form.description = eventItem.description ?? ''
  form.location = eventItem.location ?? ''
  form.startAt = eventItem.startAt
  form.endAt = eventItem.endAt
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
    locale: 'fr',
    height: 'auto',
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
  saving.value = true
  errorMessage.value = ''

  try {
    if (editingId.value) {
      await calendarStore.update(editingId.value, form)
    } else {
      await calendarStore.create(form)
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
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <span>Calendar</span>
      <v-btn color="primary" @click="openCreateDialog">Nouvel événement</v-btn>
    </v-card-title>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mx-4 mb-2">
      {{ errorMessage }}
    </v-alert>

    <v-card-text>
      <div ref="calendarRoot" class="mb-6" />

      <v-data-table :headers="headers" :items="events" :loading="loading" item-value="id">
        <template #item.actions="{ item }">
          <div class="d-flex ga-2">
            <v-btn size="small" variant="tonal" @click="openEditDialog(item)">Éditer</v-btn>
            <v-btn
              size="small"
              color="error"
              variant="tonal"
              :loading="deletingId === item.id"
              @click="deleteEvent(item.id)"
            >
              Supprimer
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card-text>

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
              <v-text-field v-model="form.startAt" label="Début (ISO)" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.endAt" label="Fin (ISO)" />
            </v-col>
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
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="isDialogOpen = false">Annuler</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveEvent">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

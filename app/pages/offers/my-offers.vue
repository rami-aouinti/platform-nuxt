<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { Notify } from '~/stores/notification'
import { httpGet, HttpRequestError } from '../../../services/http/client'
import * as jobOffersApi from '../../../services/admin/job-offers/index'
import { jobApplicationsService } from '../../../services/admin/job-applications'
import type { JobOffer } from '../../../services/admin/job-offers/index'

definePageMeta({
  icon: 'mdi-briefcase-edit-outline',
  title: 'My Offers',
  drawerIndex: 21,
  requiresAuth: true,
  middleware: ['auth'],
})

type OfferForm = {
  id?: string
  title: string
  slug: string
  description: string
  company: string
  status: JobOffer['status']
}

const jobOffersService = jobOffersApi.jobOffersService

const rows = ref<JobOffer[]>([])
const loading = ref(false)
const actionLoading = ref(false)
const error = ref<string | null>(null)
const forbidden = ref(false)
const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const location = ref('')
const selectedId = ref('')
const editDialog = ref(false)

const editing = ref<OfferForm>({
  title: '',
  slug: '',
  description: '',
  company: '',
  status: 'draft',
})
const dialogDelete = useTemplateRef('dialogDelete')
const { smAndDown } = useDisplay()

const filterSections = [
  {
    key: 'status',
    title: 'Statut',
    items: [
      { label: 'Brouillon', value: 'draft' },
      { label: 'Ouverte', value: 'open' },
      { label: 'Fermée', value: 'closed' },
    ],
  },
]
const selectedFilters = ref<Record<string, string[]>>({})
const mobileFilters = ref(false)

function firstFilter(key: string) {
  return selectedFilters.value[key]?.[0]
}

function resolveCompanyName(offer: JobOffer) {
  if (typeof offer.company === 'string')
    return offer.companyName || offer.company
  const typedCompany = offer.company as {
    id?: string
    name?: string
    legalName?: string
  }
  return (
    offer.companyName ||
    typedCompany?.name ||
    typedCompany?.legalName ||
    String(typedCompany?.id || '')
  )
}

function asLabel(value: unknown) {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return undefined

  const typedValue = value as Record<string, unknown>
  const label = typedValue.name ?? typedValue.title ?? typedValue.code
  return typeof label === 'string' ? label : undefined
}

function toOffersArray(payload: unknown): JobOffer[] {
  if (Array.isArray(payload)) return payload as JobOffer[]
  if (!payload || typeof payload !== 'object') return []

  const objectPayload = payload as {
    data?: unknown
    items?: unknown
    member?: unknown
    'hydra:member'?: unknown
  }

  const collection =
    objectPayload.data ??
    objectPayload.items ??
    objectPayload.member ??
    objectPayload['hydra:member']

  return Array.isArray(collection) ? (collection as JobOffer[]) : []
}

function formatSalary(offer: JobOffer) {
  if (!offer.salaryMin && !offer.salaryMax) return 'Gehalt auf Anfrage'
  const currency = offer.salaryCurrency || 'EUR'
  const min =
    typeof offer.salaryMin === 'number'
      ? offer.salaryMin.toLocaleString('de-DE')
      : undefined
  const max =
    typeof offer.salaryMax === 'number'
      ? offer.salaryMax.toLocaleString('de-DE')
      : undefined
  const period =
    offer.salaryPeriod === 'yearly' || !offer.salaryPeriod ? ' / an' : ''
  return `${min && max ? `${min} - ${max}` : min || max || ''} ${currency}${period}`.trim()
}

function formatRelativeDate(input?: string) {
  if (!input) return undefined
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return undefined
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return "Aujourd'hui"
  if (days === 1) return 'Hier'
  return `Il y a ${days} jours`
}


function applicationStatusLabel(status?: string) {
  if (status === 'accepted') return 'Acceptée'
  if (status === 'rejected') return 'Rejetée'
  if (status === 'withdrawn') return 'Retirée'
  return 'En attente'
}

function applicationStatusColor(status?: string) {
  if (status === 'accepted') return 'success'
  if (status === 'rejected') return 'error'
  if (status === 'withdrawn') return 'default'
  return 'warning'
}

function applicationCandidateName(application: NonNullable<JobOffer['jobApplications']>[number]) {
  const candidate = application.candidate
  if (!candidate || typeof candidate === 'string') return '-'
  return candidate.firstName || candidate.username || candidate.email || '-'
}

function canDecideApplication(application: NonNullable<JobOffer['jobApplications']>[number]) {
  return application.status === 'pending'
}

const mappedOffers = computed(() =>
  rows.value.map((row, index) => ({
    id: String(row.id),
    title: row.title,
    company: resolveCompanyName(row),
    matchingScore: 71 + (index % 5) * 4,
    location:
      row.location ||
      [asLabel(row.city), asLabel(row.region)].filter(Boolean).join(', ') ||
      location.value ||
      'Paris',
    salary: formatSalary(row),
    workMode:
      row.employmentType || row.workTime || row.remoteMode || 'full-time',
    publishedAtLabel: formatRelativeDate(row.publishedAt),
    tags: [row.slug, row.status, asLabel(row.jobCategory)].filter(
      Boolean,
    ) as string[],
    status: row.status,
  })),
)

const selectedOffer = computed(
  () =>
    mappedOffers.value.find((offer) => offer.id === selectedId.value) ??
    mappedOffers.value[0],
)

const selectedRow = computed(() =>
  rows.value.find((item) => String(item.id) === selectedOffer.value?.id),
)

const pageState = computed(() => {
  if (forbidden.value) return 'forbidden'
  if (error.value) return 'error'
  if (loading.value) return 'loading'
  if (!rows.value.length) return 'empty'
  return 'ready'
})

function toErrorMessage(errorValue: unknown) {
  if (errorValue instanceof HttpRequestError) return errorValue.message
  if (errorValue instanceof Error) return errorValue.message
  return 'Erreur API.'
}

function openEdit(offerId: string) {
  const row = rows.value.find((item) => String(item.id) === offerId)
  if (!row) return

  editing.value = {
    id: String(row.id),
    title: row.title,
    slug: row.slug,
    description: row.description,
    company: String(
      typeof row.company === 'string' ? row.company : row.company?.id || '',
    ),
    status: row.status,
  }
  editDialog.value = true
}

async function listMyOffers(query: Record<string, string | number>) {
  const payload = await httpGet<unknown>('/api/job-offers/my', {
    query,
  })
  return toOffersArray(payload)
}

async function loadRows() {
  loading.value = true
  error.value = null
  forbidden.value = false

  try {
    const where = {
      status: firstFilter('status'),
      location: location.value || undefined,
      remoteMode: firstFilter('remoteMode'),
      salaryMin: firstFilter('salaryMin'),
      salaryMax: firstFilter('salaryMax'),
      skills: firstFilter('skills'),
      languages: firstFilter('languages'),
      city: firstFilter('city'),
      region: firstFilter('region'),
      jobCategory: firstFilter('jobCategory'),
      publishedWithinDays: firstFilter('publishedWithinDays'),
    }

    const normalizedWhere = Object.fromEntries(
      Object.entries(where).filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
      ),
    )

    const response = await listMyOffers({
      where: JSON.stringify(normalizedWhere),
      order: 'publishedAt:desc',
      limit: pageSize.value,
      offset: Math.max(page.value - 1, 0) * pageSize.value,
      ...(search.value.trim() ? { search: search.value.trim() } : {}),
    })

    rows.value = response
    const firstOffer = rows.value.at(0)
    if (!selectedId.value && firstOffer) {
      selectedId.value = String(firstOffer.id)
    }
  } catch (errorValue) {
    if (
      errorValue instanceof HttpRequestError &&
      errorValue.statusCode === 403
    ) {
      forbidden.value = true
      return
    }

    error.value = toErrorMessage(errorValue)
  } finally {
    loading.value = false
  }
}

async function saveOffer() {
  if (!editing.value.id) {
    Notify.error('Offre invalide.')
    return
  }

  actionLoading.value = true
  try {
    await jobOffersService.update(editing.value.id, {
      title: editing.value.title,
      slug: editing.value.slug,
      description: editing.value.description,
      company: editing.value.company,
      status: editing.value.status,
    })
    Notify.success('Offre mise à jour.')
    editDialog.value = false
    await loadRows()
  } catch (errorValue) {
    Notify.error(toErrorMessage(errorValue))
  } finally {
    actionLoading.value = false
  }
}

async function deleteOffer(offerId: string) {
  const row = rows.value.find((item) => String(item.id) === offerId)
  if (!row) return

  const identifier = String(row.title || row.id)
  const confirmed = await dialogDelete.value?.open(
    `Supprimer l'offre ${identifier} ?`,
    {
      confirmationLabel: `Saisissez ${identifier} pour confirmer`,
      expectedConfirmationText: identifier,
    },
  )

  if (!confirmed) return

  actionLoading.value = true

  try {
    await jobOffersService.remove(offerId)
    Notify.success('Offre supprimée.')
    await loadRows()
  } catch (errorValue) {
    Notify.error(toErrorMessage(errorValue))
  } finally {
    actionLoading.value = false
  }
}


async function decideApplication(
  id: string,
  action: 'accept' | 'reject' | 'withdraw',
  successMessage: string,
) {
  actionLoading.value = true

  try {
    if (action === 'accept') await jobApplicationsService.accept(id)
    else if (action === 'reject') await jobApplicationsService.reject(id)
    else await jobApplicationsService.withdraw(id)

    Notify.success(successMessage)
    await loadRows()
  } catch (errorValue) {
    Notify.error(toErrorMessage(errorValue))
  } finally {
    actionLoading.value = false
  }
}

watch([page, pageSize], loadRows)
watchDebounced(
  [search, location, selectedFilters],
  () => {
    page.value = 1
    void loadRows()
  },
  { debounce: 300, maxWait: 1000 },
)

onMounted(loadRows)
</script>

<template>
  <main class="offers-board-page">
    <OffersSearchBar
      v-model:query="search"
      v-model:location="location"
      app-bar-teleport
      show-filter-drawer-button
      :filter-drawer-open="mobileFilters"
      @search="loadRows"
      @filter="mobileFilters = !mobileFilters"
    />

    <div class="offers-board-page__layout">
      <section class="offers-board-page__content">

        <v-alert v-if="pageState === 'forbidden'" type="error" variant="tonal"
          >403 · Accès refusé.</v-alert
        >
        <v-alert
          v-else-if="pageState === 'error'"
          type="error"
          variant="tonal"
          >{{ error || 'Erreur API.' }}</v-alert
        >
        <v-skeleton-loader
          v-else-if="pageState === 'loading'"
          type="article, article"
        />
        <v-alert v-else-if="pageState === 'empty'" type="info" variant="tonal"
          >Aucune offre à gérer.</v-alert
        >

        <div v-else class="offers-board-page__grid">
          <div class="offers-board-page__list">
            <OffersOfferListCard
              v-for="offer in mappedOffers"
              :key="offer.id"
              :offer="offer"
              :active="selectedOffer?.id === offer.id"
              action-label="Modifier"
              action-icon="mdi-pencil-outline"
              @select="selectedId = $event"
              @action="openEdit"
            />
            <v-btn
              v-if="selectedOffer"
              variant="text"
              color="error"
              prepend-icon="mdi-delete-outline"
              @click="deleteOffer(selectedOffer.id)"
            >
              Supprimer l'offre sélectionnée
            </v-btn>
          </div>

          <div v-if="selectedOffer" class="d-flex flex-column ga-4">
            <OffersOfferDetailsPanel
              :title="selectedOffer.title"
              :company="selectedOffer.company"
              :location="selectedOffer.location"
              :salary="selectedOffer.salary"
              :description="
                selectedRow?.description ||
                'Mettez à jour votre description pour présenter la mission.'
              "
              :highlights="[
                'Ajuster les missions pour refléter le besoin actuel',
                'Vérifier les prérequis et la stack technique',
                'Mettre à jour les informations de rémunération',
              ]"
              :requirements="[
                'Expérience adaptée au poste',
                'Bon niveau de communication',
                'Autonomie et sens de l\'organisation',
              ]"
              :perks="[
                'Télétravail possible',
                'Prime annuelle',
                'Mutuelle premium',
              ]"
            />

            <v-card variant="flat" rounded="lg" border>
              <v-card-title class="text-subtitle-1">Candidatures</v-card-title>
              <v-divider />
              <v-list lines="two" density="comfortable">
                <template
                  v-for="application in selectedRow?.jobApplications || []"
                  :key="application.id"
                >
                  <v-list-item>
                    <template #title>
                      <div class="d-flex align-center ga-2">
                        <span>{{ applicationCandidateName(application) }}</span>
                        <v-chip
                          size="small"
                          :color="applicationStatusColor(application.status)"
                          variant="tonal"
                          >{{ applicationStatusLabel(application.status) }}</v-chip
                        >
                      </div>
                    </template>
                    <template #subtitle>
                      <span>Application ID: {{ application.id }}</span>
                    </template>
                    <template #append>
                      <div class="d-flex ga-1">
                        <v-btn
                          v-if="canDecideApplication(application)"
                          size="small"
                          color="success"
                          variant="text"
                          icon="mdi-check"
                          :loading="actionLoading"
                          @click="decideApplication(String(application.id), 'accept', 'Candidature acceptée.')"
                        />
                        <v-btn
                          v-if="canDecideApplication(application)"
                          size="small"
                          color="error"
                          variant="text"
                          icon="mdi-close"
                          :loading="actionLoading"
                          @click="decideApplication(String(application.id), 'reject', 'Candidature rejetée.')"
                        />
                        <v-btn
                          size="small"
                          color="default"
                          variant="text"
                          icon="mdi-undo-variant"
                          :loading="actionLoading"
                          @click="decideApplication(String(application.id), 'withdraw', 'Candidature retirée.')"
                        />
                      </div>
                    </template>
                  </v-list-item>
                  <v-divider />
                </template>

                <v-list-item
                  v-if="!(selectedRow?.jobApplications || []).length"
                  title="Aucune candidature"
                  subtitle="Cette offre n'a pas encore reçu de candidature."
                />
              </v-list>
            </v-card>
          </div>
        </div>
      </section>
    </div>

    <v-navigation-drawer
      v-model="mobileFilters"
      class="offers-filters-drawer"
      :temporary="smAndDown"
      :scrim="smAndDown"
      floating
      location="right"
      width="300"
    >
      <div>
        <OffersFiltersSidebar
          v-model="selectedFilters"
          title="Segments"
          :sections="filterSections"
        />
      </div>
    </v-navigation-drawer>

    <DialogConfirm ref="dialogDelete" />

    <v-dialog v-model="editDialog" max-width="760">
      <v-card>
        <v-card-title>Modifier l'offre</v-card-title>
        <v-card-text class="pt-4">
          <v-text-field v-model="editing.title" label="Titre" class="mb-2" />
          <v-text-field v-model="editing.slug" label="Slug" class="mb-2" />
          <v-text-field
            v-model="editing.company"
            label="ID entreprise"
            class="mb-2"
          />
          <v-select
            v-model="editing.status"
            :items="[
              { title: 'Brouillon', value: 'draft' },
              { title: 'Ouverte', value: 'open' },
              { title: 'Fermée', value: 'closed' },
            ]"
            label="Statut"
            class="mb-2"
          />
          <v-textarea
            v-model="editing.description"
            label="Description"
            rows="4"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">Annuler</v-btn>
          <v-btn color="primary" :loading="actionLoading" @click="saveOffer"
            >Enregistrer</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </main>
</template>

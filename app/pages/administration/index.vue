<script setup lang="ts">
import { storeToRefs } from 'pinia'
import AdminBadge from '~/components/admin/ui/AdminBadge.vue'
import AdminCard from '~/components/admin/ui/AdminCard.vue'
import AdminToolbar from '~/components/admin/ui/AdminToolbar.vue'
import { useAuthStore } from '~/stores/auth'
import {
  hasAdminPermission,
  type AdminPermission,
} from '~/utils/permissions/admin'

type StatisticCard = {
  icon: string
  title: string
  value: number
  color: string
  caption: string
}

type StatisticsOverview = {
  cards: StatisticCard[]
  totalEntities: number
  totalRecords: number
}

type StatisticsEntity = {
  entity: string
  count: number
}

type TimeseriesPoint = {
  date: string
  value: number
}

type TimeseriesResponse = {
  series: TimeseriesPoint[]
}

type DistributionPoint = {
  label: string
  value: number
}

type DistributionsResponse = {
  tasks: DistributionPoint[]
  jobApplications: DistributionPoint[]
  jobOffers: DistributionPoint[]
  offers: DistributionPoint[]
}

definePageMeta({
  icon: 'mdi-shield-crown-outline',
  title: 'Administration',
  drawerIndex: 7,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
})

const authStore = useAuthStore()
const { roles } = storeToRefs(authStore)

const links = [
  {
    title: 'Users',
    to: '/administration/users',
    icon: 'mdi-account-multiple-outline',
    description: 'Gérer les utilisateurs de la plateforme.',
    permission: 'manageUsers' as AdminPermission,
  },
  {
    title: 'User Groups',
    to: '/administration/user-groups',
    icon: 'mdi-account-group-outline',
    description: 'Organiser les utilisateurs en groupes.',
    permission: 'manageUsers' as AdminPermission,
  },
  {
    title: 'Roles',
    to: '/administration/roles',
    icon: 'mdi-shield-account-outline',
    description: 'Configurer les rôles et permissions.',
    permission: 'admin' as AdminPermission,
  },
  {
    title: 'Api Keys',
    to: '/administration/api-keys',
    icon: 'mdi-key-variant',
    description: 'Administrer les clés API.',
    permission: 'manageApiKeys' as AdminPermission,
  },
  {
    title: 'Companies',
    to: '/administration/companies',
    icon: 'mdi-domain',
    description: 'Maintenir le référentiel entreprises.',
    permission: 'admin' as AdminPermission,
  },
  {
    title: 'Candidates',
    to: '/administration/candidates',
    icon: 'mdi-account-search',
    description: 'Gérer le vivier de candidats.',
    permission: 'admin' as AdminPermission,
  },
  {
    title: 'Notifications',
    to: '/administration/notifications',
    icon: 'mdi-bell-outline',
    description: 'Consulter et administrer les notifications.',
    permission: 'admin' as AdminPermission,
  },
]

const scopedLinks = computed(() =>
  links.map((entry) => ({
    ...entry,
    disabled: !hasAdminPermission(roles.value, entry.permission),
  })),
)

const hasAnyLink = computed(() => scopedLinks.value.some((entry) => !entry.disabled))

const statisticsLoading = ref(false)
const statisticsError = ref('')
const overview = ref<StatisticsOverview | null>(null)
const entities = ref<StatisticsEntity[]>([])
const distributions = ref<DistributionsResponse | null>(null)
const timeseries = ref<TimeseriesPoint[]>([])

const topEntities = computed(() =>
  [...entities.value]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((entry) => ({ label: entry.entity, value: entry.count })),
)

const jobOfferStatuses = computed(() =>
  (distributions.value?.jobOffers ?? []).map((entry) => ({
    label: entry.label,
    value: entry.value,
  })),
)

async function loadStatistics() {
  statisticsLoading.value = true
  statisticsError.value = ''

  try {
    const [overviewData, entitiesData, timeseriesData, distributionsData] = await Promise.all([
      $fetch<StatisticsOverview>('/api/v1/statistics/overview', { method: 'GET' }),
      $fetch<StatisticsEntity[]>('/api/v1/statistics/entities', { method: 'GET' }),
      $fetch<TimeseriesResponse>('/api/v1/statistics/timeseries', { method: 'GET' }),
      $fetch<DistributionsResponse>('/api/v1/statistics/distributions/statuses', { method: 'GET' }),
    ])

    overview.value = overviewData
    entities.value = entitiesData
    timeseries.value = timeseriesData.series ?? []
    distributions.value = distributionsData
  }
  catch (error) {
    console.error(error)
    statisticsError.value = 'Impossible de charger les statistiques de la plateforme.'
  }
  finally {
    statisticsLoading.value = false
  }
}

onMounted(async () => {
  await authStore.ensureRolesLoaded()
  await loadStatistics()
})
</script>

<template>
  <AdminCard>
    <AdminToolbar
      title="Administration"
      description="Accédez rapidement à chaque ressource d'administration depuis cette page."
    >
      <template #actions>
        <AdminBadge status="info" label="Prototype" />
      </template>
    </AdminToolbar>

    <v-alert
      v-if="statisticsError"
      class="mb-4"
      type="error"
      variant="tonal"
      :text="statisticsError"
    />

    <div v-if="statisticsLoading" class="d-flex justify-center my-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <template v-else-if="overview">
      <v-row dense class="mb-2">
        <v-col
          v-for="stat in overview.cards"
          :key="stat.title"
          cols="12"
          sm="6"
          md="4"
          lg="2"
        >
          <StatsCard
            :title="stat.title"
            :color="stat.color"
            :icon="stat.icon"
            :value="stat.value"
          >
            <template #footer>
              {{ stat.caption }}
            </template>
          </StatsCard>
        </v-col>
      </v-row>

      <v-row class="mb-4" dense>
        <v-col cols="12" lg="6">
          <v-card class="pa-2" height="340">
            <v-card-title class="text-subtitle-1">Évolution globale (30 jours)</v-card-title>
            <ChartLine :points="timeseries" series-name="Total" />
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card class="pa-2" height="340">
            <v-card-title class="text-subtitle-1">Top entités</v-card-title>
            <ChartBar :items="topEntities" series-name="Enregistrements" />
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card class="pa-2" height="340">
            <v-card-title class="text-subtitle-1">Statuts des offres d'emploi</v-card-title>
            <ChartPie :items="jobOfferStatuses" series-name="Offres" />
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-divider class="mb-4" />

    <v-row class="mt-1" dense>
      <v-col
        v-for="entry in scopedLinks"
        :key="entry.to"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card rounded="lg" variant="outlined" class="h-100 d-flex flex-column">
          <v-card-title class="d-flex align-center ga-2">
            <v-icon :icon="entry.icon" />
            <span>{{ entry.title }}</span>
          </v-card-title>

          <v-card-text class="text-medium-emphasis">{{ entry.description }}</v-card-text>

          <v-spacer />

          <v-card-actions>
            <v-btn
              block
              color="primary"
              variant="tonal"
              :to="entry.disabled ? undefined : entry.to"
              :disabled="entry.disabled"
            >
              Ouvrir
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-alert
      v-if="!hasAnyLink"
      class="mt-4"
      type="warning"
      variant="tonal"
      title="Aucun accès disponible"
      text="Votre rôle ne permet pas d'ouvrir une ressource d'administration."
    />
  </AdminCard>
</template>

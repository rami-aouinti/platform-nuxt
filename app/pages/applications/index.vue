<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { useProfileApplicationsApi, type ProfileApplication } from '~/composables/api/useProfileApplicationsApi'

definePageMeta({
  title: 'Applications',
  icon: 'mdi-apps',
  requiresAuth: true,
  layout: 'default',
  middleware: ['auth'],
})

const applicationsApi = useProfileApplicationsApi()
const loading = ref(false)
const togglingId = ref<string | null>(null)
const applications = ref<ProfileApplication[]>([])

const availableApplications = computed(() =>
  applications.value.filter((application) => application.enabled),
)

async function loadApplications() {
  loading.value = true

  try {
    applications.value = await applicationsApi.list()
  }
  catch (error) {
    Notify.error(error)
  }
  finally {
    loading.value = false
  }
}

async function toggleApplication(application: ProfileApplication) {
  if (!application.enabled) {
    return
  }

  togglingId.value = application.id

  try {
    const updated = application.active
      ? await applicationsApi.deactivate(application.id)
      : await applicationsApi.activate(application.id)

    const index = applications.value.findIndex((item) => item.id === application.id)

    if (index >= 0) {
      applications.value[index] = {
        ...applications.value[index],
        active: updated.active,
      }
    }
  }
  catch (error) {
    Notify.error(error)
  }
  finally {
    togglingId.value = null
  }
}

onMounted(loadApplications)
</script>

<template>
  <v-container fluid class="pa-6 bg-grey-lighten-4 min-h-screen">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Applications</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Activez ou désactivez les applications disponibles pour votre profil.
        </p>
      </div>
      <v-btn
        prepend-icon="mdi-refresh"
        variant="text"
        :loading="loading"
        @click="loadApplications"
      >
        Recharger
      </v-btn>
    </div>

    <v-row v-if="loading && !applications.length">
      <v-col v-for="index in 6" :key="`skeleton-${index}`" cols="12" md="6" lg="4">
        <v-skeleton-loader type="card" class="rounded-xl" />
      </v-col>
    </v-row>

    <v-alert
      v-else-if="!availableApplications.length"
      type="info"
      variant="tonal"
      border="start"
      icon="mdi-information-outline"
    >
      Aucune application disponible pour le moment.
    </v-alert>

    <v-row v-else>
      <v-col
        v-for="application in availableApplications"
        :key="application.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card rounded="xl" elevation="4" class="h-100 pa-6">
          <div class="d-flex align-start ga-4">
            <v-avatar size="72" rounded="xl" color="grey-darken-4">
              <v-img
                v-if="application.logo"
                :src="application.logo"
                :alt="`Logo ${application.name}`"
                width="48"
                height="48"
              />
              <span v-else class="text-caption font-weight-bold">{{ application.name.slice(0, 2).toUpperCase() }}</span>
            </v-avatar>

            <div class="flex-grow-1">
              <h2 class="text-h5 font-weight-bold mb-1">{{ application.name }}</h2>
              <v-chip
                :color="application.active ? 'success' : 'grey'"
                size="small"
                variant="tonal"
              >
                {{ application.active ? 'Active' : 'Inactive' }}
              </v-chip>
            </div>
          </div>

          <p class="text-body-1 text-medium-emphasis mt-4 mb-6">
            {{ application.description || 'Aucune description.' }}
          </p>

          <v-btn
            block
            :color="application.active ? 'warning' : 'primary'"
            :variant="application.active ? 'outlined' : 'flat'"
            :loading="togglingId === application.id"
            :disabled="loading"
            @click="toggleApplication(application)"
          >
            {{ application.active ? 'Désactiver' : 'Activer' }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

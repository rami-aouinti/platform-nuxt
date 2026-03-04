<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePlatformApplicationsStore } from '~/stores/platformApplications'

definePageMeta({
  title: 'Platform',
  icon: 'mdi-apps',
  requiresAuth: true,
  layout: 'default',
  middleware: ['auth'],
})

const platformApplicationsStore = usePlatformApplicationsStore()
const { applications, loading, actionLoadingId } = storeToRefs(platformApplicationsStore)
const route = useRoute()
const isPlatformIndexRoute = computed(() => route.path === '/platform')

onMounted(() => {
  void platformApplicationsStore.fetchApplications()
})
</script>

<template>
  <v-container v-if="isPlatformIndexRoute" fluid class="pa-6 min-h-screen">
    <v-row v-if="loading && !applications.length">
      <v-col v-for="index in 6" :key="`platform-skeleton-${index}`" cols="12" md="6" lg="4">
        <v-skeleton-loader type="card" class="rounded-xl" />
      </v-col>
    </v-row>

    <v-alert
      v-else-if="!applications.length"
      type="info"
      variant="tonal"
      border="start"
      icon="mdi-information-outline"
    >
      Aucune application disponible pour le moment.
    </v-alert>

    <v-row v-else>
      <v-col
        v-for="application in applications"
        :key="application.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card rounded="xl" elevation="4" class="h-100 pa-6">
          <div class="d-flex align-start ga-4">
            <v-avatar size="64" rounded="lg">
              <v-img
                v-if="application.logo"
                :src="application.logo"
                :alt="`Logo ${application.name}`"
              />
              <span v-else class="text-caption font-weight-bold">
                {{ application.name.slice(0, 2).toUpperCase() }}
              </span>
            </v-avatar>

            <div class="flex-grow-1">
              <h2 class="text-h6 font-weight-bold mb-1">{{ application.name }}</h2>
              <v-chip
                :color="application.enabled ? 'success' : 'grey'"
                size="small"
                variant="tonal"
              >
                {{ application.enabled ? 'Installée' : 'Non installée' }}
              </v-chip>
            </div>
          </div>

          <p class="text-body-2 text-medium-emphasis mt-4 mb-6">
            {{ application.description || 'Aucune description.' }}
          </p>

          <v-btn
            v-if="application.enabled !== true"
            block
            color="primary"
            :loading="actionLoadingId === application.id"
            :disabled="loading"
            @click="platformApplicationsStore.installApplication(application.id)"
          >
            Install
          </v-btn>

          <div v-else class="d-flex ga-3">
            <v-btn
              color="warning"
              variant="outlined"
              class="flex-grow-1"
              :loading="actionLoadingId === application.id"
              :disabled="loading"
              @click="platformApplicationsStore.uninstallApplication(application.id)"
            >
              Désinstaller
            </v-btn>

            <v-btn
              color="primary"
              variant="tonal"
              class="flex-grow-1"
              :to="`/platform/${application.id}/setup`"
            >
              Open
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <NuxtPage v-else />
</template>

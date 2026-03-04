<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
  usePlatformPluginsApi,
  type PlatformPlugin,
} from '~/composables/api/usePlatformPluginsApi'
import { usePlatformApplicationsStore } from '~/stores/platformApplications'
import { Notify } from '~/stores/notification'

definePageMeta({
  title: 'Plugin Setup',
  icon: 'mdi-tune-variant',
  requiresAuth: true,
  layout: 'default',
  middleware: ['auth'],
})

const route = useRoute()
const userApplicationId = computed(() =>
  String(route.params.userApplicationId ?? ''),
)
const pluginId = computed(() => String(route.params.pluginId ?? ''))

const pluginsApi = usePlatformPluginsApi()
const platformApplicationsStore = usePlatformApplicationsStore()
const { applications } = storeToRefs(platformApplicationsStore)

const loadingPlugins = ref(false)
const plugins = ref<PlatformPlugin[]>([])

const application = computed(
  () =>
    applications.value.find(
      (item) => item.userApplicationId === userApplicationId.value,
    ) ?? null,
)

const currentPlugin = computed(
  () => plugins.value.find((item) => item.id === pluginId.value) ?? null,
)

const installedPlugins = computed(() =>
  plugins.value.filter((item) => item.enabled === true),
)

async function fetchPlugins() {
  loadingPlugins.value = true

  try {
    plugins.value = await pluginsApi.listByUserApplication(userApplicationId.value)
  } catch (error) {
    Notify.error(error)
  } finally {
    loadingPlugins.value = false
  }
}

onMounted(async () => {
  if (!applications.value.length) {
    await platformApplicationsStore.fetchApplications()
  }

  await fetchPlugins()
})
</script>

<template>
  <v-container fluid class="pa-6 min-h-screen">
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      :to="`/platform/${userApplicationId}/setup`"
      class="mb-4"
    >
      Retour aux plugins
    </v-btn>

    <v-row class="ga-md-0 ga-4">
      <v-col cols="12" md="4">
        <v-card rounded="xl" elevation="2" class="plugin-setup-card pa-6 h-100">
          <h1 class="text-h5 font-weight-bold mb-2">
            {{ currentPlugin?.name || 'Plugin' }}
          </h1>
          <p class="text-body-2 text-medium-emphasis mb-4">
            {{ currentPlugin?.description || 'Aucune description pour ce plugin.' }}
          </p>

          <v-chip
            :color="currentPlugin?.enabled ? 'success' : 'grey'"
            size="small"
            variant="tonal"
          >
            {{ currentPlugin?.enabled ? 'Installé' : 'Non installé' }}
          </v-chip>

          <v-divider class="my-4" />

          <p class="text-caption text-medium-emphasis mb-1">User-application</p>
          <p class="text-body-2 mb-4">{{ application?.name || userApplicationId }}</p>

          <p class="text-caption text-medium-emphasis mb-1">Plugin ID</p>
          <p class="text-body-2 mb-0">{{ pluginId }}</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="xl" elevation="2" class="plugin-setup-card pa-6 h-100">
          <h2 class="text-h6 font-weight-bold mb-3">Configuration du plugin</h2>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Zone de configuration dédiée au plugin sélectionné.
          </p>

          <v-alert type="info" variant="tonal" border="start">
            Les champs de configuration seront affichés ici.
          </v-alert>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="xl" elevation="2" class="plugin-setup-card pa-6 h-100">
          <h2 class="text-h6 font-weight-bold mb-3">Plugins installés</h2>

          <v-skeleton-loader
            v-if="loadingPlugins"
            type="list-item-two-line, list-item-two-line, list-item-two-line"
          />

          <v-list v-else-if="installedPlugins.length" density="comfortable" lines="two" class="bg-transparent pa-0">
            <v-list-item
              v-for="plugin in installedPlugins"
              :key="plugin.id"
              :to="`/platform/${userApplicationId}/${plugin.id}/setup`"
              rounded="lg"
              class="mb-2"
              :active="plugin.id === pluginId"
              active-class="plugin-list-item--active"
            >
              <template #prepend>
                <v-avatar size="36" rounded="lg" class="mr-3">
                  <v-img
                    v-if="plugin.logo"
                    :src="plugin.logo"
                    :alt="`Logo ${plugin.name}`"
                  />
                  <span v-else class="text-caption font-weight-bold">
                    {{ plugin.name.slice(0, 2).toUpperCase() }}
                  </span>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-medium">
                {{ plugin.name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ plugin.description || 'Aucune description.' }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-alert v-else type="info" variant="tonal" border="start">
            Aucun plugin installé.
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.plugin-setup-card {
  border: 1px solid rgb(var(--v-theme-primary), 0.12);
  background:
    radial-gradient(
      circle at top right,
      rgb(var(--v-theme-primary), 0.1),
      transparent 62%
    ),
    linear-gradient(
      145deg,
      rgb(var(--v-theme-surface), 1),
      rgb(var(--v-theme-surface-bright), 1)
    );
}

.plugin-list-item--active {
  background: rgb(var(--v-theme-primary), 0.14);
  border: 1px solid rgb(var(--v-theme-primary), 0.26);
}
</style>

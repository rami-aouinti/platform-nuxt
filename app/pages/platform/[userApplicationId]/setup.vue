<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
  usePlatformPluginsApi,
  type PlatformPlugin,
} from '~/composables/api/usePlatformPluginsApi'
import { usePlatformApplicationsStore } from '~/stores/platformApplications'
import { Notify } from '~/stores/notification'

definePageMeta({
  title: 'Platform Setup',
  icon: 'mdi-cog-outline',
  requiresAuth: true,
  layout: 'default',
  middleware: ['auth'],
})

const route = useRoute()
const userApplicationId = computed(() =>
  String(route.params.userApplicationId ?? ''),
)

const pluginsApi = usePlatformPluginsApi()
const platformApplicationsStore = usePlatformApplicationsStore()
const { applications } = storeToRefs(platformApplicationsStore)

const loading = ref(false)
const plugins = ref<PlatformPlugin[]>([])
const pluginActionLoadingId = ref<string | null>(null)
const selectedPluginId = ref<string | null>(null)

const application = computed(
  () =>
    applications.value.find(
      (item) => item.userApplicationId === userApplicationId.value,
    ) ?? null,
)

const selectedPlugin = computed(
  () => plugins.value.find((plugin) => plugin.id === selectedPluginId.value) ?? null,
)

async function fetchPlugins() {
  loading.value = true

  try {
    plugins.value = await pluginsApi.listByUserApplication(userApplicationId.value)

    if (!plugins.value.length) {
      selectedPluginId.value = null
      return
    }

    const selectedStillExists = plugins.value.some(
      (plugin) => plugin.id === selectedPluginId.value,
    )

    if (!selectedStillExists) {
      const firstEnabledPlugin = plugins.value.find((plugin) => plugin.enabled)
      selectedPluginId.value = firstEnabledPlugin?.id ?? plugins.value[0].id
    }
  } catch (error) {
    Notify.error(error)
  } finally {
    loading.value = false
  }
}

async function installPlugin(pluginId: string) {
  pluginActionLoadingId.value = pluginId

  try {
    const updated = await pluginsApi.attach(userApplicationId.value, pluginId)
    const index = plugins.value.findIndex((item) => item.id === pluginId)

    if (index >= 0) {
      plugins.value[index] = {
        ...plugins.value[index],
        enabled: updated.enabled,
        active: updated.active,
      }
    }

    selectedPluginId.value = pluginId
    Notify.success('Plugin installé avec succès')
  } catch (error) {
    Notify.error(error)
  } finally {
    pluginActionLoadingId.value = null
  }
}

async function uninstallPlugin(pluginId: string) {
  pluginActionLoadingId.value = pluginId

  try {
    await pluginsApi.detach(userApplicationId.value, pluginId)
    await fetchPlugins()
    Notify.success('Plugin désinstallé avec succès')
  } catch (error) {
    Notify.error(error)
  } finally {
    pluginActionLoadingId.value = null
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
      to="/platform"
      class="mb-4"
    >
      Retour
    </v-btn>

    <v-card rounded="xl" elevation="2" class="pa-6 mb-6">
      <div class="d-flex align-start ga-4">
        <v-avatar size="72" rounded="lg">
          <v-img
            v-if="application?.logo"
            :src="application.logo"
            :alt="`Logo ${application.name}`"
          />
          <span v-else class="text-subtitle-2 font-weight-bold">
            {{ application?.name?.slice(0, 2).toUpperCase() || 'PL' }}
          </span>
        </v-avatar>

        <div>
          <h1 class="text-h5 font-weight-bold mb-2">
            {{ application?.name || 'Platform' }}
          </h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ application?.description || 'Aucune description.' }}
          </p>
        </div>
      </div>
    </v-card>

    <v-row v-if="loading">
      <v-col v-for="index in 3" :key="`plugin-layout-skeleton-${index}`" cols="12" md="4">
        <v-skeleton-loader type="card" class="rounded-xl" />
      </v-col>
    </v-row>

    <v-alert v-else-if="!plugins.length" type="info" variant="tonal" border="start">
      Aucun plugin disponible pour cette application.
    </v-alert>

    <v-row v-else class="ga-md-0 ga-4">
      <v-col cols="12" md="4">
        <v-card rounded="xl" elevation="2" class="plugin-layout-card pa-6 h-100">
          <h2 class="text-h6 font-weight-bold mb-2">
            {{ selectedPlugin?.name || 'Plugin' }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mb-4">
            {{ selectedPlugin?.description || 'Sélectionnez un plugin à droite.' }}
          </p>

          <v-chip
            :color="selectedPlugin?.enabled ? 'success' : 'grey'"
            size="small"
            variant="tonal"
          >
            {{ selectedPlugin?.enabled ? 'Installé' : 'Non installé' }}
          </v-chip>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="xl" elevation="2" class="plugin-layout-card pa-6 h-100">
          <h2 class="text-h6 font-weight-bold mb-2">Configuration du plugin</h2>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Configuration de: <strong>{{ selectedPlugin?.name || '-' }}</strong>
          </p>

          <v-alert
            v-if="!selectedPlugin"
            type="info"
            variant="tonal"
            border="start"
          >
            Sélectionnez un plugin pour commencer.
          </v-alert>

          <v-alert
            v-else-if="!selectedPlugin.enabled"
            type="warning"
            variant="tonal"
            border="start"
          >
            Installez ce plugin avant de le configurer.
          </v-alert>

          <v-btn
            v-else
            color="primary"
            block
            :to="`/platform/${userApplicationId}/${selectedPlugin.id}/setup`"
          >
            Ouvrir la configuration avancée
          </v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="xl" elevation="2" class="plugin-layout-card pa-4 h-100">
          <h2 class="text-h6 font-weight-bold px-2 mb-3">Liste des plugins</h2>

          <v-list density="comfortable" lines="two" class="bg-transparent pa-0">
            <v-list-item
              v-for="plugin in plugins"
              :key="plugin.id"
              rounded="lg"
              class="mb-2 plugin-list-item"
              :class="{ 'plugin-list-item--active': selectedPluginId === plugin.id }"
              @click="selectedPluginId = plugin.id"
            >
              <template #prepend>
                <v-avatar size="40" rounded="lg" class="mr-3">
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
                {{ plugin.enabled ? 'Installé' : 'Non installé' }}
              </v-list-item-subtitle>

              <template #append>
                <v-btn
                  v-if="plugin.enabled !== true"
                  size="small"
                  color="primary"
                  variant="flat"
                  :loading="pluginActionLoadingId === plugin.id"
                  @click.stop="installPlugin(plugin.id)"
                >
                  Installer
                </v-btn>

                <v-btn
                  v-else
                  size="small"
                  color="warning"
                  variant="outlined"
                  :loading="pluginActionLoadingId === plugin.id"
                  @click.stop="uninstallPlugin(plugin.id)"
                >
                  Désinstaller
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.plugin-layout-card {
  border: 1px solid rgb(var(--v-theme-primary), 0.14);
  background:
    radial-gradient(
      circle at top right,
      rgb(var(--v-theme-primary), 0.12),
      transparent 58%
    ),
    linear-gradient(
      145deg,
      rgb(var(--v-theme-surface), 1),
      rgb(var(--v-theme-surface-bright), 1)
    );
}

.plugin-list-item {
  border: 1px solid transparent;
}

.plugin-list-item--active {
  background: rgb(var(--v-theme-primary), 0.12);
  border-color: rgb(var(--v-theme-primary), 0.26);
}
</style>

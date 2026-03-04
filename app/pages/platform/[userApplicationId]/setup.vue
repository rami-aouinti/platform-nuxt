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
const pluginInfoDialog = ref<PlatformPlugin | null>(null)
const pluginSetupDialog = ref<PlatformPlugin | null>(null)

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
    <client-only>
      <teleport to="#app-bar">
        <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/platform" class="mr-2">
          Retour
        </v-btn>
      </teleport>
    </client-only>

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
          <div class="d-flex align-start ga-3 mb-4">
            <v-avatar size="56" rounded="lg">
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
              <h1 class="text-h6 font-weight-bold mb-1">
                {{ application?.name || 'Platform' }}
              </h1>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ application?.description || 'Aucune description.' }}
              </p>
            </div>
          </div>

          <v-divider class="mb-4" />

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
          <h2 class="text-h6 font-weight-bold mb-2">Configuration du platform</h2>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Paramètres globaux de: <strong>{{ application?.name || 'votre platform' }}</strong>
          </p>

          <p class="text-body-2 text-medium-emphasis mb-3">
            Activez des options générales pour adapter l'expérience à votre organisation.
          </p>

          <v-list density="compact" class="bg-transparent pa-0 mb-4">
            <v-list-item prepend-icon="mdi-theme-light-dark" title="Thème dynamique" subtitle="Ajuste automatiquement les couleurs selon le contexte" />
            <v-list-item prepend-icon="mdi-shield-check" title="Sécurité renforcée" subtitle="Validation supplémentaire sur les actions sensibles" />
            <v-list-item prepend-icon="mdi-rocket-launch" title="Mode performance" subtitle="Optimise le chargement des modules principaux" />
          </v-list>

          <v-alert
            v-if="!selectedPlugin"
            type="info"
            variant="tonal"
            border="start"
          >
            Sélectionnez un plugin pour ouvrir son setup détaillé.
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
            Ouvrir le setup avancé
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
                <div class="d-flex align-center ga-2">
                  <v-btn
                    size="small"
                    variant="text"
                    color="info"
                    @click.stop="pluginInfoDialog = plugin"
                  >
                    Info
                  </v-btn>

                  <v-btn
                    size="small"
                    variant="outlined"
                    color="primary"
                    @click.stop="pluginSetupDialog = plugin"
                  >
                    Setup
                  </v-btn>

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
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog
      :model-value="Boolean(pluginInfoDialog)"
      max-width="560"
      @update:model-value="(isOpen) => !isOpen && (pluginInfoDialog = null)"
    >
      <v-card rounded="xl">
        <v-card-title class="text-h6">
          Infos plugin — {{ pluginInfoDialog?.name }}
        </v-card-title>
        <v-card-text>
          {{ pluginInfoDialog?.description || 'Aucune description disponible pour ce plugin.' }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="pluginInfoDialog = null">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      :model-value="Boolean(pluginSetupDialog)"
      max-width="640"
      @update:model-value="(isOpen) => !isOpen && (pluginSetupDialog = null)"
    >
      <v-card rounded="xl">
        <v-card-title class="text-h6">
          Setup plugin — {{ pluginSetupDialog?.name }}
        </v-card-title>
        <v-card-text>
          <p class="mb-3">
            Configuration rapide du plugin <strong>{{ pluginSetupDialog?.name }}</strong>.
          </p>
          <v-alert
            v-if="pluginSetupDialog && !pluginSetupDialog.enabled"
            type="warning"
            variant="tonal"
            border="start"
          >
            Ce plugin n'est pas encore installé. Installez-le avant de sauvegarder la configuration.
          </v-alert>
          <v-text-field label="Nom d'affichage" variant="outlined" density="comfortable" hide-details="auto" class="mb-3" />
          <v-switch label="Activer au démarrage" color="primary" hide-details />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="pluginSetupDialog = null">Annuler</v-btn>
          <v-btn color="primary" @click="pluginSetupDialog = null">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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

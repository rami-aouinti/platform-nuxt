<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePlatformPluginsApi, type PlatformPlugin } from '~/composables/api/usePlatformPluginsApi'
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
const userApplicationId = computed(() => String(route.params.userApplicationId ?? ''))

const pluginsApi = usePlatformPluginsApi()
const platformApplicationsStore = usePlatformApplicationsStore()
const { applications } = storeToRefs(platformApplicationsStore)

const loading = ref(false)
const plugins = ref<PlatformPlugin[]>([])
const pluginActionLoadingId = ref<string | null>(null)

const application = computed(() =>
  applications.value.find(item => item.userApplicationId === userApplicationId.value) ?? null,
)

async function fetchPlugins() {
  loading.value = true

  try {
    plugins.value = await pluginsApi.listByUserApplication(userApplicationId.value)
  }
  catch (error) {
    Notify.error(error)
  }
  finally {
    loading.value = false
  }
}

async function installPlugin(pluginId: string) {
  pluginActionLoadingId.value = pluginId

  try {
    const updated = await pluginsApi.attach(userApplicationId.value, pluginId)
    const index = plugins.value.findIndex(item => item.id === pluginId)

    if (index >= 0) {
      plugins.value[index] = {
        ...plugins.value[index],
        enabled: updated.enabled,
        active: updated.active,
      }
    }

    Notify.success('Plugin installé avec succès')
  }
  catch (error) {
    Notify.error(error)
  }
  finally {
    pluginActionLoadingId.value = null
  }
}

async function uninstallPlugin(pluginId: string) {
  pluginActionLoadingId.value = pluginId

  try {
    await pluginsApi.detach(userApplicationId.value, pluginId)
    await fetchPlugins()
    Notify.success('Plugin désinstallé avec succès')
  }
  catch (error) {
    Notify.error(error)
  }
  finally {
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
    <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/platform" class="mb-4">
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
          <h1 class="text-h5 font-weight-bold mb-2">{{ application?.name || 'Platform' }}</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ application?.description || 'Aucune description.' }}
          </p>
        </div>
      </div>
    </v-card>

    <v-row v-if="loading">
      <v-col v-for="index in 3" :key="`plugin-skeleton-${index}`" cols="12" md="6" lg="4">
        <v-skeleton-loader type="card" class="rounded-xl" />
      </v-col>
    </v-row>

    <v-alert v-else-if="!plugins.length" type="info" variant="tonal" border="start">
      Aucun plugin disponible pour cette application.
    </v-alert>

    <v-row v-else>
      <v-col v-for="plugin in plugins" :key="plugin.id" cols="12" md="6" lg="4">
        <v-card rounded="xl" elevation="2" class="pa-6 h-100">
          <div class="d-flex align-start ga-4">
            <v-avatar size="56" rounded="lg">
              <v-img
                v-if="plugin.logo"
                :src="plugin.logo"
                :alt="`Logo ${plugin.name}`"
              />
              <span v-else class="text-caption font-weight-bold">
                {{ plugin.name.slice(0, 2).toUpperCase() }}
              </span>
            </v-avatar>

            <div class="flex-grow-1">
              <h2 class="text-h6 font-weight-bold mb-1">{{ plugin.name }}</h2>
              <v-chip :color="plugin.enabled ? 'success' : 'grey'" size="small" variant="tonal">
                {{ plugin.enabled ? 'Installé' : 'Non installé' }}
              </v-chip>
            </div>
          </div>

          <p class="text-body-2 text-medium-emphasis mt-4 mb-6">
            {{ plugin.description || 'Aucune description.' }}
          </p>

          <v-btn
            v-if="plugin.enabled !== true"
            block
            color="primary"
            :loading="pluginActionLoadingId === plugin.id"
            :disabled="loading"
            @click="installPlugin(plugin.id)"
          >
            Installer
          </v-btn>

          <div v-else class="d-flex ga-3">
            <v-btn
              color="warning"
              variant="outlined"
              class="flex-grow-1"
              :loading="pluginActionLoadingId === plugin.id"
              :disabled="loading"
              @click="uninstallPlugin(plugin.id)"
            >
              Désinstaller
            </v-btn>

            <v-btn
              color="primary"
              variant="tonal"
              class="flex-grow-1"
              :to="`/platform/${userApplicationId}/${plugin.id}/setup`"
            >
              Setup
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

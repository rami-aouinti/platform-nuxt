<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
  usePlatformApplicationsApi,
  type PlatformApplication,
} from '~/composables/api/usePlatformApplicationsApi'
import { usePlatformPluginsApi, type PlatformPlugin } from '~/composables/api/usePlatformPluginsApi'
import { Notify } from '~/stores/notification'
import { usePlatformApplicationsStore } from '~/stores/platformApplications'

definePageMeta({
  title: 'Platform',
  icon: 'mdi-apps',
  requiresAuth: true,
  layout: 'default',
  middleware: ['auth'],
})

const platformApplicationsStore = usePlatformApplicationsStore()
const applicationsApi = usePlatformApplicationsApi()
const pluginsApi = usePlatformPluginsApi()
const { applications, loading } = storeToRefs(platformApplicationsStore)
const route = useRoute()
const isPlatformIndexRoute = computed(() => route.path === '/platform')

const creationDialog = ref(false)
const creationStep = ref(1)
const creatingUserApplication = ref(false)
const savingMetadata = ref(false)
const loadingCatalogApplications = ref(false)
const loadingPlugins = ref(false)
const pluginActionLoadingId = ref<string | null>(null)

const catalogApplications = ref<PlatformApplication[]>([])
const allPlugins = ref<PlatformPlugin[]>([])
const selectedPluginIds = ref<Set<string>>(new Set())

const createdUserApplication = ref<PlatformApplication | null>(null)
const metadataName = ref('')
const metadataLogo = ref<File | null>(null)

const canMoveToStep2 = computed(() => Boolean(createdUserApplication.value?.id))

function resetCreationState() {
  creationStep.value = 1
  creatingUserApplication.value = false
  savingMetadata.value = false
  loadingCatalogApplications.value = false
  loadingPlugins.value = false
  pluginActionLoadingId.value = null
  selectedPluginIds.value = new Set()
  createdUserApplication.value = null
  metadataName.value = ''
  metadataLogo.value = null
}

async function fetchCatalogApplications() {
  loadingCatalogApplications.value = true

  try {
    catalogApplications.value = await applicationsApi.listCatalogApplications()
  }
  catch (error) {
    Notify.error(error)
  }
  finally {
    loadingCatalogApplications.value = false
  }
}

async function fetchPluginsCatalog() {
  loadingPlugins.value = true

  try {
    allPlugins.value = await pluginsApi.listAll()
  }
  catch (error) {
    Notify.error(error)
  }
  finally {
    loadingPlugins.value = false
  }
}

async function openCreationDialog() {
  resetCreationState()
  creationDialog.value = true
  await fetchCatalogApplications()
}

async function selectCatalogApplication(applicationId: string) {
  creatingUserApplication.value = true

  try {
    const created = await applicationsApi.createUserApplication(applicationId)
    createdUserApplication.value = created
    metadataName.value = created.name
    creationStep.value = 2
    Notify.success('Platform créée avec succès')
  }
  catch (error) {
    Notify.error(error)
  }
  finally {
    creatingUserApplication.value = false
  }
}

async function goToPluginsStep(saveMetadata: boolean) {
  if (!canMoveToStep2.value) {
    return
  }

  if (saveMetadata && createdUserApplication.value) {
    savingMetadata.value = true

    try {
      createdUserApplication.value = await applicationsApi.updateUserApplicationMetadata(
        createdUserApplication.value.id,
        {
          name: metadataName.value,
          logo: metadataLogo.value,
        },
      )
      Notify.success('Métadonnées enregistrées')
    }
    catch (error) {
      Notify.error(error)
      savingMetadata.value = false
      return
    }
    finally {
      savingMetadata.value = false
    }
  }

  creationStep.value = 3
  await fetchPluginsCatalog()
}

async function togglePlugin(plugin: PlatformPlugin) {
  if (!createdUserApplication.value) {
    return
  }

  const userApplicationId = createdUserApplication.value.id
  const isAttached = selectedPluginIds.value.has(plugin.id)
  pluginActionLoadingId.value = plugin.id

  try {
    if (isAttached) {
      await pluginsApi.detach(userApplicationId, plugin.id)
      selectedPluginIds.value.delete(plugin.id)
      Notify.success('Plugin détaché')
    }
    else {
      await pluginsApi.attach(userApplicationId, plugin.id)
      selectedPluginIds.value.add(plugin.id)
      Notify.success('Plugin attaché')
    }
  }
  catch (error) {
    Notify.error(error)
  }
  finally {
    pluginActionLoadingId.value = null
  }
}

async function finishCreation() {
  creationDialog.value = false
  resetCreationState()
  await platformApplicationsStore.fetchApplications()
}

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

    <v-row v-else>
      <v-col cols="12" md="6" lg="4">
        <v-card
          rounded="xl"
          elevation="2"
          class="h-100 pa-6 d-flex flex-column justify-center align-center text-center border-dashed"
          style="min-height: 260px; cursor: pointer;"
          @click="openCreationDialog"
        >
          <v-icon size="56" color="primary" icon="mdi-plus-circle-outline" />
          <h2 class="text-h6 font-weight-bold mt-4">+ New Platform</h2>
          <p class="text-body-2 text-medium-emphasis mt-2 mb-0">
            Créez une nouvelle user-application et configurez ses plugins.
          </p>
        </v-card>
      </v-col>

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
                :color="application.active ? 'success' : 'grey'"
                size="small"
                variant="tonal"
              >
                {{ application.active ? 'Active' : 'Inactive' }}
              </v-chip>
            </div>
          </div>

          <p class="text-body-2 text-medium-emphasis mt-4 mb-6">
            {{ application.description || 'Aucune description.' }}
          </p>

          <v-btn
            block
            color="primary"
            variant="tonal"
            :to="`/platform/${application.id}/setup`"
            :disabled="!application.id"
          >
            Open
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="creationDialog" max-width="960" persistent>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="text-h6">New Platform</span>
          <v-btn icon="mdi-close" variant="text" @click="creationDialog = false" />
        </v-card-title>

        <v-divider />

        <v-stepper v-model="creationStep" alt-labels class="elevation-0">
          <v-stepper-header>
            <v-stepper-item :value="1" title="Application" />
            <v-divider />
            <v-stepper-item :value="2" title="Metadata" :disabled="!canMoveToStep2" />
            <v-divider />
            <v-stepper-item :value="3" title="Plugins" :disabled="!canMoveToStep2" />
          </v-stepper-header>

          <v-stepper-window>
            <v-stepper-window-item :value="1">
              <v-card-text>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  Sélectionnez une application pour créer votre user-application.
                </p>

                <v-row v-if="loadingCatalogApplications">
                  <v-col v-for="index in 4" :key="`catalog-skeleton-${index}`" cols="12" md="6">
                    <v-skeleton-loader type="card" class="rounded-xl" />
                  </v-col>
                </v-row>

                <v-row v-else>
                  <v-col v-for="catalogApp in catalogApplications" :key="catalogApp.id" cols="12" md="6">
                    <v-card
                      rounded="xl"
                      elevation="1"
                      class="pa-4 h-100"
                      :class="{ 'opacity-75': creatingUserApplication }"
                    >
                      <div class="d-flex align-start ga-4">
                        <v-avatar size="56" rounded="lg">
                          <v-img
                            v-if="catalogApp.logo"
                            :src="catalogApp.logo"
                            :alt="`Logo ${catalogApp.name}`"
                          />
                          <span v-else class="text-caption font-weight-bold">
                            {{ catalogApp.name.slice(0, 2).toUpperCase() }}
                          </span>
                        </v-avatar>

                        <div class="flex-grow-1">
                          <h3 class="text-subtitle-1 font-weight-bold mb-1">{{ catalogApp.name }}</h3>
                          <p class="text-body-2 text-medium-emphasis mb-3">
                            {{ catalogApp.description || 'Aucune description.' }}
                          </p>

                          <v-btn
                            color="primary"
                            block
                            :loading="creatingUserApplication"
                            :disabled="creatingUserApplication"
                            @click="selectCatalogApplication(catalogApp.id)"
                          >
                            Sélectionner
                          </v-btn>
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-stepper-window-item>

            <v-stepper-window-item :value="2">
              <v-card-text>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  Personnalisez votre user-application (nom et logo), puis passez à la configuration des plugins.
                </p>

                <v-text-field
                  v-model="metadataName"
                  label="Name"
                  variant="outlined"
                  prepend-inner-icon="mdi-format-title"
                  class="mb-4"
                />

                <v-file-input
                  v-model="metadataLogo"
                  label="Upload logo"
                  accept="image/*"
                  variant="outlined"
                  prepend-icon="mdi-image-outline"
                  show-size
                  clearable
                />
              </v-card-text>

              <v-card-actions class="px-6 pb-6">
                <v-spacer />
                <v-btn
                  variant="text"
                  :disabled="savingMetadata"
                  @click="goToPluginsStep(false)"
                >
                  Skip
                </v-btn>
                <v-btn
                  color="primary"
                  :loading="savingMetadata"
                  @click="goToPluginsStep(true)"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-stepper-window-item>

            <v-stepper-window-item :value="3">
              <v-card-text>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  Attachez les plugins que vous souhaitez activer sur votre platform.
                </p>

                <v-row v-if="loadingPlugins">
                  <v-col v-for="index in 6" :key="`plugins-skeleton-${index}`" cols="12" md="6">
                    <v-skeleton-loader type="card" class="rounded-xl" />
                  </v-col>
                </v-row>

                <v-row v-else>
                  <v-col v-for="plugin in allPlugins" :key="plugin.id" cols="12" md="6">
                    <v-card rounded="xl" elevation="1" class="pa-4 h-100">
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
                          <h3 class="text-subtitle-1 font-weight-bold mb-1">{{ plugin.name }}</h3>
                          <p class="text-body-2 text-medium-emphasis mb-3">
                            {{ plugin.description || 'Aucune description.' }}
                          </p>

                          <v-btn
                            block
                            :color="selectedPluginIds.has(plugin.id) ? 'warning' : 'primary'"
                            :variant="selectedPluginIds.has(plugin.id) ? 'outlined' : 'flat'"
                            :loading="pluginActionLoadingId === plugin.id"
                            @click="togglePlugin(plugin)"
                          >
                            {{ selectedPluginIds.has(plugin.id) ? 'Detach' : 'Attach' }}
                          </v-btn>
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-card-actions class="px-6 pb-6">
                <v-spacer />
                <v-btn color="primary" @click="finishCreation">
                  Finish
                </v-btn>
              </v-card-actions>
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </v-card>
    </v-dialog>
  </v-container>

  <NuxtPage v-else />
</template>

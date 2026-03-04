<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
  usePlatformApplicationsApi,
  type PlatformApplication,
} from '~/composables/api/usePlatformApplicationsApi'
import {
  usePlatformPluginsApi,
  type PlatformPlugin,
} from '~/composables/api/usePlatformPluginsApi'
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
const deletingUserApplicationId = ref<string | null>(null)
const editingUserApplication = ref<PlatformApplication | null>(null)
const editDialog = ref(false)
const editingUserApplicationLoading = ref(false)
const loadingCatalogApplications = ref(false)
const loadingPlugins = ref(false)
const pluginActionLoadingId = ref<string | null>(null)

const catalogApplications = ref<PlatformApplication[]>([])
const allPlugins = ref<PlatformPlugin[]>([])
const selectedPluginIds = ref<Set<string>>(new Set())

const createdUserApplication = ref<PlatformApplication | null>(null)
const metadataName = ref('')
const metadataLogo = ref<File | null>(null)
const editName = ref('')
const editDescription = ref('')

const canMoveToStep2 = computed(() => Boolean(createdUserApplication.value?.id))

function goToApplicationSetup(applicationId: string) {
  void navigateTo(`/platform/${applicationId}/setup`)
}

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
  } catch (error) {
    Notify.error(error)
  } finally {
    loadingCatalogApplications.value = false
  }
}

async function fetchPluginsCatalog() {
  loadingPlugins.value = true

  try {
    allPlugins.value = await pluginsApi.listAll()
  } catch (error) {
    Notify.error(error)
  } finally {
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
  } catch (error) {
    Notify.error(error)
  } finally {
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
      createdUserApplication.value =
        await applicationsApi.updateUserApplicationMetadata(
          createdUserApplication.value.id,
          {
            name: metadataName.value,
          },
        )
      Notify.success('Métadonnées enregistrées')
    } catch (error) {
      Notify.error(error)
      savingMetadata.value = false
      return
    } finally {
      savingMetadata.value = false
    }
  }

  creationStep.value = 3
  await fetchPluginsCatalog()
}

function openEditDialog(application: PlatformApplication) {
  editingUserApplication.value = application
  editName.value = application.name
  editDescription.value = application.description ?? ''
  editDialog.value = true
}

async function saveUserApplicationEdit() {
  if (!editingUserApplication.value) {
    return
  }

  editingUserApplicationLoading.value = true

  try {
    await applicationsApi.updateUserApplicationMetadata(
      editingUserApplication.value.id,
      {
        name: editName.value,
        description: editDescription.value,
      },
    )
    Notify.success('Application mise à jour')
    editDialog.value = false
    await platformApplicationsStore.fetchApplications()
  } catch (error) {
    Notify.error(error)
  } finally {
    editingUserApplicationLoading.value = false
  }
}

async function deleteUserApplication(application: PlatformApplication) {
  const confirmed = globalThis.confirm(`Supprimer ${application.name} ?`)

  if (!confirmed) {
    return
  }

  deletingUserApplicationId.value = application.id

  try {
    await applicationsApi.deleteUserApplication(application.id)
    Notify.success('Application supprimée')
    await platformApplicationsStore.fetchApplications()
  } catch (error) {
    Notify.error(error)
  } finally {
    deletingUserApplicationId.value = null
  }
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
    } else {
      await pluginsApi.attach(userApplicationId, plugin.id)
      selectedPluginIds.value.add(plugin.id)
      Notify.success('Plugin attaché')
    }
  } catch (error) {
    Notify.error(error)
  } finally {
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
      <v-col
        v-for="index in 6"
        :key="`platform-skeleton-${index}`"
        cols="12"
        md="6"
        lg="4"
      >
        <v-skeleton-loader type="card" class="rounded-xl" />
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12" md="6" lg="4">
        <v-card
          rounded="xl"
          elevation="2"
          class="platform-card platform-card--create h-100 pa-6 d-flex flex-column justify-center align-center text-center border-dashed"
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
        <v-card
          rounded="xl"
          elevation="4"
          class="platform-card h-100 pa-6 position-relative cursor-pointer"
          @click="goToApplicationSetup(application.id)"
        >
          <div
            v-if="application.owner"
            class="position-absolute"
            style="top: 8px; right: 8px; z-index: 2"
            @click.stop
          >
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-dots-vertical"
                  variant="text"
                  size="small"
                  :loading="deletingUserApplicationId === application.id"
                />
              </template>

              <v-list density="compact">
                <v-list-item
                  prepend-icon="mdi-pencil-outline"
                  title="Edit"
                  @click="openEditDialog(application)"
                />
                <v-list-item
                  prepend-icon="mdi-delete-outline"
                  title="Delete"
                  base-color="error"
                  @click="deleteUserApplication(application)"
                />
              </v-list>
            </v-menu>
          </div>

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
              <h2 class="text-h6 font-weight-bold mb-1">
                {{ application.name }}
              </h2>
              <v-chip
                :color="application.active ? 'success' : 'grey'"
                size="small"
                variant="tonal"
              >
                {{ application.active ? 'Active' : 'Inactive' }}
              </v-chip>
            </div>
          </div>

          <p
            class="platform-card__description text-body-2 text-medium-emphasis mt-4 mb-0"
          >
            {{ application.description || 'Aucune description.' }}
          </p>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog
      v-model="creationDialog"
      persistent
      fullscreen
      scrollable
    >
      <v-card class="creation-dialog-card">
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="text-h6">New Platform</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="creationDialog = false"
          />
        </v-card-title>

        <v-divider />

        <v-stepper
          v-model="creationStep"
          alt-labels
          class="elevation-0 creation-dialog-stepper"
        >
          <v-stepper-header>
            <v-stepper-item :value="1" title="Application" />
            <v-divider />
            <v-stepper-item
              :value="2"
              title="Metadata"
              :disabled="!canMoveToStep2"
            />
            <v-divider />
            <v-stepper-item
              :value="3"
              title="Plugins"
              :disabled="!canMoveToStep2"
            />
          </v-stepper-header>

          <v-stepper-window>
            <v-stepper-window-item :value="1">
              <v-card-text>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  Sélectionnez une application pour créer votre
                  user-application.
                </p>

                <v-row v-if="loadingCatalogApplications">
                  <v-col
                    v-for="index in 6"
                    :key="`catalog-skeleton-${index}`"
                    cols="12"
                    md="6"
                    lg="4"
                  >
                    <v-skeleton-loader type="card" class="rounded-xl" />
                  </v-col>
                </v-row>

                <v-row v-else>
                  <v-col
                    v-for="catalogApp in catalogApplications"
                    :key="catalogApp.id"
                    cols="12"
                    md="6"
                    lg="4"
                  >
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
                          <h3 class="text-subtitle-1 font-weight-bold mb-1">
                            {{ catalogApp.name }}
                          </h3>
                          <p class="text-body-2 text-medium-emphasis mb-3">
                            {{
                              catalogApp.description || 'Aucune description.'
                            }}
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
                  Personnalisez votre user-application (nom et logo), puis
                  passez à la configuration des plugins.
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
                  Attachez les plugins que vous souhaitez activer sur votre
                  platform.
                </p>

                <v-row v-if="loadingPlugins">
                  <v-col
                    v-for="index in 6"
                    :key="`plugins-skeleton-${index}`"
                    cols="12"
                    md="6"
                    lg="4"
                  >
                    <v-skeleton-loader type="card" class="rounded-xl" />
                  </v-col>
                </v-row>

                <v-row v-else>
                  <v-col
                    v-for="plugin in allPlugins"
                    :key="plugin.id"
                    cols="12"
                    md="6"
                    lg="4"
                  >
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
                          <h3 class="text-subtitle-1 font-weight-bold mb-1">
                            {{ plugin.name }}
                          </h3>
                          <p class="text-body-2 text-medium-emphasis mb-3">
                            {{ plugin.description || 'Aucune description.' }}
                          </p>

                          <v-btn
                            block
                            :color="
                              selectedPluginIds.has(plugin.id)
                                ? 'warning'
                                : 'primary'
                            "
                            :variant="
                              selectedPluginIds.has(plugin.id)
                                ? 'outlined'
                                : 'flat'
                            "
                            :loading="pluginActionLoadingId === plugin.id"
                            @click="togglePlugin(plugin)"
                          >
                            {{
                              selectedPluginIds.has(plugin.id)
                                ? 'Detach'
                                : 'Attach'
                            }}
                          </v-btn>
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-card-actions class="px-6 pb-6">
                <v-spacer />
                <v-btn color="primary" @click="finishCreation"> Finish </v-btn>
              </v-card-actions>
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editDialog" max-width="560">
      <v-card rounded="xl">
        <v-card-title class="text-h6">Edit user-application</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editName"
            label="Name"
            variant="outlined"
            prepend-inner-icon="mdi-format-title"
            class="mb-4"
          />

          <v-textarea
            v-model="editDescription"
            label="Description"
            variant="outlined"
            rows="3"
            auto-grow
          />
        </v-card-text>
        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn
            variant="text"
            :disabled="editingUserApplicationLoading"
            @click="editDialog = false"
            >Cancel</v-btn
          >
          <v-btn
            color="primary"
            :loading="editingUserApplicationLoading"
            @click="saveUserApplicationEdit"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>

  <NuxtPage v-else />
</template>

<style scoped>
.platform-card {
  min-height: 260px;
  border: 1px solid rgb(var(--v-theme-primary), 0.16);
  background:
    radial-gradient(
      circle at top right,
      rgb(var(--v-theme-primary), 0.18),
      transparent 52%
    ),
    linear-gradient(
      135deg,
      rgb(var(--v-theme-surface), 1),
      rgb(var(--v-theme-surface-bright), 1)
    );
  backdrop-filter: blur(4px);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.platform-card:hover {
  transform: translateY(-6px);
  border-color: rgb(var(--v-theme-primary), 0.4);
  box-shadow: 0 16px 36px rgb(12 17 29 / 18%);
}

.platform-card--create {
  min-height: 230px;
  cursor: pointer;
  border-style: dashed;
  border-width: 2px;
  background:
    radial-gradient(
      circle at top,
      rgb(var(--v-theme-primary), 0.3),
      transparent 62%
    ),
    linear-gradient(
      160deg,
      rgb(var(--v-theme-primary), 0.08),
      rgb(var(--v-theme-surface), 1)
    );
}

.platform-card__description {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.creation-dialog-card {
  height: 100vh;
  border-radius: 0;
}

.creation-dialog-stepper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.creation-dialog-stepper .v-stepper-window) {
  overflow-y: auto;
}
</style>

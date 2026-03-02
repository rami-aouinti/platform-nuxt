<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { useBlogApi } from '~/composables/api/useBlogApi'
import { toUiErrorMessage } from '~/utils/errors/toUiErrorMessage'

type BlogCollectionKey = 'posts' | 'comments' | 'tags' | 'links'

type BlogCollectionConfig = {
  key: BlogCollectionKey
  title: string
  subtitle: string
  icon: string
  createExample: Record<string, unknown>
  updateExample: Record<string, unknown>
}

const blogApi = useBlogApi()

const collections: BlogCollectionConfig[] = [
  {
    key: 'posts',
    title: 'Articles',
    subtitle: 'Gestion des contenus principaux du blog',
    icon: 'mdi-post-outline',
    createExample: {
      title: 'Nouvel article',
      content: 'Contenu de démonstration',
      status: 'draft',
    },
    updateExample: {
      title: 'Article mis à jour',
      status: 'published',
    },
  },
  {
    key: 'comments',
    title: 'Commentaires',
    subtitle: 'Modération et traitement des retours lecteurs',
    icon: 'mdi-comment-text-multiple-outline',
    createExample: {
      content: 'Commentaire de démonstration',
      authorName: 'User Demo',
      status: 'pending',
    },
    updateExample: {
      content: 'Commentaire édité',
      status: 'approved',
    },
  },
  {
    key: 'tags',
    title: 'Tags',
    subtitle: 'Classification et SEO des publications',
    icon: 'mdi-tag-multiple-outline',
    createExample: {
      name: 'Nuxt',
      slug: 'nuxt',
    },
    updateExample: {
      name: 'NuxtJS',
    },
  },
  {
    key: 'links',
    title: 'Liens d’articles',
    subtitle: 'Liens internes / externes associés aux posts',
    icon: 'mdi-link-variant',
    createExample: {
      label: 'Documentation Nuxt',
      url: 'https://nuxt.com',
    },
    updateExample: {
      label: 'Documentation Nuxt 4',
    },
  },
]

const currentTab = ref<BlogCollectionKey>('posts')
const loading = ref(false)
const actionLoading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const selectedItemId = ref<string>('')
const taskId = ref('')
const taskRequestId = ref('')
const taskPosts = ref<Record<string, unknown>[]>([])
const taskRequestPosts = ref<Record<string, unknown>[]>([])

const recordsByCollection = reactive<Record<BlogCollectionKey, Record<string, unknown>[]>>({
  posts: [],
  comments: [],
  tags: [],
  links: [],
})

const currentCollection = computed(() => collections.find((item) => item.key === currentTab.value) ?? collections[0])

const currentRecords = computed(() => {
  if (!search.value.trim()) {
    return recordsByCollection[currentTab.value]
  }

  const keyword = search.value.toLowerCase()
  return recordsByCollection[currentTab.value].filter((item) =>
    JSON.stringify(item).toLowerCase().includes(keyword),
  )
})

const stats = computed(() =>
  collections.map((collection) => ({
    ...collection,
    count: recordsByCollection[collection.key].length,
  })),
)

function extractId(record: Record<string, unknown>) {
  const raw = record.id ?? record['@id'] ?? record.uuid
  return raw === undefined || raw === null ? '' : String(raw)
}

function apiForCollection(key: BlogCollectionKey) {
  return blogApi[key]
}

async function loadCurrentCollection() {
  loading.value = true
  error.value = null

  try {
    const response = await apiForCollection(currentTab.value).list()
    recordsByCollection[currentTab.value] = response.data

    const [first] = response.data
    selectedItemId.value = first ? extractId(first) : ''
  } catch (errorValue) {
    error.value = toUiErrorMessage(errorValue)
  } finally {
    loading.value = false
  }
}

async function runCrudDemo(action: 'create' | 'get' | 'update' | 'patch' | 'delete') {
  actionLoading.value = true

  try {
    const api = apiForCollection(currentTab.value)

    if (action === 'create') {
      await api.create(currentCollection.value.createExample)
      Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.collectionCreateSuccess', { title: currentCollection.value.title })))
      await loadCurrentCollection()
      return
    }

    if (!selectedItemId.value) {
      Notify.error(String(useNuxtApp().$i18n.t('notifications.ui.noIdentifierAvailable')))
      return
    }

    if (action === 'get') {
      const item = await api.get(selectedItemId.value)
      Notify.info(String(useNuxtApp().$i18n.t('notifications.ui.detailLoaded', { id: extractId(item) || useNuxtApp().$i18n.t('notifications.ui.idUnknown') })))
      return
    }

    if (action === 'update') {
      await api.update(selectedItemId.value, currentCollection.value.updateExample)
      Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.putUpdateSuccess')))
      await loadCurrentCollection()
      return
    }

    if (action === 'patch') {
      await api.patch(selectedItemId.value, currentCollection.value.updateExample)
      Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.patchUpdateSuccess')))
      await loadCurrentCollection()
      return
    }

    await api.delete(selectedItemId.value)
    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.deleteSuccess')))
    await loadCurrentCollection()
  } catch (errorValue) {
    Notify.error(toUiErrorMessage(errorValue))
  } finally {
    actionLoading.value = false
  }
}

async function loadTaskPosts() {
  if (!taskId.value.trim()) {
    Notify.error(String(useNuxtApp().$i18n.t('notifications.ui.taskIdRequiredBeforeLoad')))
    return
  }

  try {
    const response = await blogApi.listTaskPosts(taskId.value.trim())
    taskPosts.value = response.data
    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.taskBlogPostsLoaded')))
  } catch (errorValue) {
    Notify.error(toUiErrorMessage(errorValue))
  }
}

async function loadTaskRequestPosts() {
  if (!taskRequestId.value.trim()) {
    Notify.error(String(useNuxtApp().$i18n.t('notifications.ui.taskRequestIdRequiredBeforeLoad')))
    return
  }

  try {
    const response = await blogApi.listTaskRequestPosts(taskRequestId.value.trim())
    taskRequestPosts.value = response.data
    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.taskRequestBlogPostsLoaded')))
  } catch (errorValue) {
    Notify.error(toUiErrorMessage(errorValue))
  }
}

watch(currentTab, () => {
  search.value = ''
  void loadCurrentCollection()
})

onMounted(() => {
  void loadCurrentCollection()
})
</script>

<template>
  <v-container fluid class="py-6">
    <v-row class="mb-4">
      <v-col v-for="item in stats" :key="item.key" cols="12" sm="6" lg="3">
        <v-card variant="tonal" color="primary" class="h-100">
          <v-card-text class="d-flex align-center ga-3">
            <v-avatar color="primary" variant="outlined">
              <v-icon :icon="item.icon" />
            </v-avatar>
            <div>
              <div class="text-overline text-medium-emphasis">{{ item.title }}</div>
              <div class="text-h6 font-weight-bold">{{ item.count }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card elevation="2" rounded="lg">
      <v-card-title class="d-flex align-center ga-2 flex-wrap">
        <v-icon icon="mdi-newspaper-variant-multiple-outline" color="primary" />
        <span>Blog API Control Center</span>
      </v-card-title>
      <v-card-subtitle class="mb-2">Interface connectée aux endpoints blog (authentification requise)</v-card-subtitle>

      <v-tabs v-model="currentTab" color="primary" align-tabs="start">
        <v-tab v-for="item in collections" :key="item.key" :value="item.key" :prepend-icon="item.icon">
          {{ item.title }}
        </v-tab>
      </v-tabs>

      <v-divider />

      <v-card-text>
        <div class="d-flex ga-3 align-center flex-wrap mb-4">
          <v-text-field
            v-model="search"
            density="comfortable"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            label="Rechercher dans la collection"
            hide-details
            class="flex-grow-1"
            min-width="280"
          />
          <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadCurrentCollection">
            Rafraîchir
          </v-btn>
        </div>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />

        <v-sheet class="pa-4 rounded-lg bg-grey-lighten-5 mb-4">
          <div class="text-subtitle-1 font-weight-bold mb-1">{{ currentCollection.title }}</div>
          <div class="text-body-2 text-medium-emphasis">{{ currentCollection.subtitle }}</div>

          <div class="d-flex ga-2 flex-wrap mt-4">
            <v-btn color="success" prepend-icon="mdi-plus" :loading="actionLoading" @click="runCrudDemo('create')">POST</v-btn>
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-eye" :loading="actionLoading" @click="runCrudDemo('get')">GET by ID</v-btn>
            <v-btn color="warning" variant="tonal" prepend-icon="mdi-content-save-edit" :loading="actionLoading" @click="runCrudDemo('update')">PUT</v-btn>
            <v-btn color="warning" prepend-icon="mdi-tune-variant" :loading="actionLoading" @click="runCrudDemo('patch')">PATCH</v-btn>
            <v-btn color="error" variant="tonal" prepend-icon="mdi-delete" :loading="actionLoading" @click="runCrudDemo('delete')">DELETE</v-btn>
          </div>
        </v-sheet>

        <v-select
          v-model="selectedItemId"
          :items="currentRecords.map((item) => ({ title: extractId(item) || JSON.stringify(item).slice(0, 40), value: extractId(item) }))"
          label="Sélectionner un élément pour GET/PUT/PATCH/DELETE"
          variant="outlined"
          density="comfortable"
          clearable
          class="mb-4"
        />

        <v-expansion-panels variant="accordion">
          <v-expansion-panel>
            <v-expansion-panel-title>Résultats JSON ({{ currentRecords.length }})</v-expansion-panel-title>
            <v-expansion-panel-text>
              <pre class="json-viewer">{{ JSON.stringify(currentRecords, null, 2) }}</pre>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title>Endpoints liés aux tâches</v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field v-model="taskId" label="Task ID" variant="outlined" density="comfortable" />
                  <v-btn color="primary" variant="tonal" prepend-icon="mdi-briefcase-search-outline" @click="loadTaskPosts">
                    GET /tasks/{id}/blog-posts
                  </v-btn>
                  <pre class="json-viewer mt-3">{{ JSON.stringify(taskPosts, null, 2) }}</pre>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field v-model="taskRequestId" label="Task Request ID" variant="outlined" density="comfortable" />
                  <v-btn color="primary" variant="tonal" prepend-icon="mdi-list-status" @click="loadTaskRequestPosts">
                    GET /task-requests/{id}/blog-posts
                  </v-btn>
                  <pre class="json-viewer mt-3">{{ JSON.stringify(taskRequestPosts, null, 2) }}</pre>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.json-viewer {
  max-height: 280px;
  overflow: auto;
  padding: 12px;
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline-variant));
  font-size: 12px;
}
</style>

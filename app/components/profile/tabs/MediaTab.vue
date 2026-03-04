<script setup lang="ts">
import { apiEndpoints } from '~/services/api/endpoints'

const { t } = useI18n()

type MediaFile = {
  id: string
  name: string
  folderId?: string | null
  ownerId?: string
  mimeType?: string
  size?: number
  path?: string
  type: 'file'
}

type MediaFolder = {
  id: string
  name: string
  ownerId?: string
  type: 'folder'
  children?: MediaNode[]
}

type MediaNode = MediaFolder | MediaFile

type Crumb = {
  id: string
  name: string
}

const loading = ref(false)
const actionLoading = ref(false)
const tree = ref<MediaFolder[]>([])
const currentFolderId = ref<string | null>(null)
const breadcrumbs = ref<Crumb[]>([])
const createFolderName = ref('')
const createFolderDialog = ref(false)
const imagePreviewDialog = ref(false)
const imagePreviewTitle = ref('')
const imagePreviewSrc = ref('')
const uploadInput = ref<HTMLInputElement | null>(null)

const foldersEndpoint = apiEndpoints.frontend.media.folders
const uploadFileEndpoint = apiEndpoints.frontend.media.uploadFile

const currentFolder = computed<MediaFolder | null>(() => {
  if (!currentFolderId.value) return null
  return findFolderById(tree.value, currentFolderId.value)
})

const visibleNodes = computed<MediaNode[]>(() => {
  if (!currentFolder.value) return tree.value
  return currentFolder.value.children ?? []
})

const currentPathLabel = computed(() => {
  if (breadcrumbs.value.length === 0) return 'Root'
  return ['Root', ...breadcrumbs.value.map((crumb) => crumb.name)].join(' / ')
})

function findFolderById(nodes: MediaNode[], id: string): MediaFolder | null {
  for (const node of nodes) {
    if (node.type === 'folder') {
      if (node.id === id) return node
      const nested = findFolderById(node.children ?? [], id)
      if (nested) return nested
    }
  }

  return null
}

function isImage(file: MediaFile) {
  return typeof file.mimeType === 'string' && file.mimeType.startsWith('image/')
}

function formatSize(size?: number) {
  if (!size || Number.isNaN(size)) return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function fileIcon(file: MediaFile) {
  if (isImage(file)) return 'mdi-file-image-outline'
  if (file.mimeType?.includes('pdf')) return 'mdi-file-pdf-box'
  if (file.mimeType?.includes('sheet') || file.mimeType?.includes('excel')) return 'mdi-file-excel-box'
  if (file.mimeType?.includes('word') || file.mimeType?.includes('document')) return 'mdi-file-word-box'
  if (file.mimeType?.includes('presentation')) return 'mdi-file-powerpoint-box'
  if (file.mimeType?.includes('zip')) return 'mdi-folder-zip-outline'
  return 'mdi-file-outline'
}

function openFolder(folder: MediaFolder) {
  currentFolderId.value = folder.id
  breadcrumbs.value.push({ id: folder.id, name: folder.name })
}

function goToCrumb(index: number) {
  if (index < 0) {
    currentFolderId.value = null
    breadcrumbs.value = []
    return
  }

  const crumb = breadcrumbs.value[index]
  currentFolderId.value = crumb.id
  breadcrumbs.value = breadcrumbs.value.slice(0, index + 1)
}

function goToParent() {
  if (breadcrumbs.value.length <= 1) {
    currentFolderId.value = null
    breadcrumbs.value = []
    return
  }

  breadcrumbs.value.pop()
  currentFolderId.value = breadcrumbs.value[breadcrumbs.value.length - 1]?.id ?? null
}

async function loadTree() {
  loading.value = true

  try {
    tree.value = await $fetch<MediaFolder[]>(foldersEndpoint)
  }
  catch (error) {
    Notify.error(error)
  }
  finally {
    loading.value = false
  }
}

async function createFolder() {
  const name = createFolderName.value.trim()

  if (!name) return

  actionLoading.value = true

  try {
    await $fetch(foldersEndpoint, {
      method: 'POST',
      body: {
        name,
        ...(currentFolderId.value ? { parentId: currentFolderId.value } : {}),
      },
    })

    createFolderName.value = ''
    createFolderDialog.value = false
    await loadTree()
    Notify.success(t('profile.media.folderCreated'))
  }
  catch (error) {
    Notify.error(error)
  }
  finally {
    actionLoading.value = false
  }
}

function triggerUpload() {
  uploadInput.value?.click()
}

async function onUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  if (currentFolderId.value) {
    formData.append('folderId', currentFolderId.value)
  }

  actionLoading.value = true

  try {
    await $fetch(uploadFileEndpoint, {
      method: 'POST',
      body: formData,
    })

    Notify.success(t('profile.media.fileUploaded'))
    await loadTree()
  }
  catch (error) {
    Notify.error(error)
  }
  finally {
    target.value = ''
    actionLoading.value = false
  }
}

function openImagePreview(file: MediaFile) {
  if (!file.path) return
  imagePreviewTitle.value = file.name
  imagePreviewSrc.value = file.path.startsWith('http') ? file.path : `/${file.path.replace(/^\/+/, '')}`
  imagePreviewDialog.value = true
}

async function deleteNode(node: MediaNode) {
  const hasChildren = node.type === 'folder' && (node.children?.length ?? 0) > 0
  const warning = hasChildren
    ? t('profile.media.deleteFolderWithChildrenWarning', { name: node.name })
    : t('profile.media.deleteConfirm', { name: node.name })

  if (!window.confirm(warning)) return

  actionLoading.value = true

  try {
    if (node.type === 'folder') {
      await $fetch(apiEndpoints.frontend.media.folderById(node.id), { method: 'DELETE' })
    }
    else {
      await $fetch(apiEndpoints.frontend.media.fileById(node.id), { method: 'DELETE' })
    }

    Notify.success(t('profile.media.deleted'))

    if (node.type === 'folder' && node.id === currentFolderId.value) {
      goToParent()
    }

    await loadTree()
  }
  catch (error) {
    Notify.error(error)
  }
  finally {
    actionLoading.value = false
  }
}

onMounted(loadTree)
</script>

<template>
  <v-card class="profile-block media-explorer pa-4 pa-md-6" rounded="xl" elevation="0">
    <div class="d-flex align-center justify-space-between ga-3 flex-wrap mb-4">
      <div>
        <h3 class="text-h4 text-typo mb-1">{{ t('profile.media.title') }}</h3>
        <div class="text-body-2 text-medium-emphasis">{{ currentPathLabel }}</div>
      </div>

      <div class="d-flex align-center ga-2 flex-wrap">
        <input ref="uploadInput" type="file" class="d-none" @change="onUpload" />
        <v-btn color="primary" prepend-icon="mdi-folder-plus" :loading="actionLoading" @click="createFolderDialog = true">
          {{ t('profile.media.createFolder') }}
        </v-btn>
        <v-btn color="secondary" prepend-icon="mdi-upload" :loading="actionLoading" @click="triggerUpload">
          {{ t('profile.media.uploadFile') }}
        </v-btn>
      </div>
    </div>

    <div class="d-flex align-center ga-2 flex-wrap mb-4">
      <v-btn
        variant="text"
        prepend-icon="mdi-home-outline"
        :disabled="!currentFolderId"
        @click="goToCrumb(-1)"
      >
        Root
      </v-btn>
      <v-btn
        variant="text"
        prepend-icon="mdi-arrow-up"
        :disabled="!currentFolderId"
        @click="goToParent"
      >
        {{ t('profile.media.parentFolder') }}
      </v-btn>
      <v-breadcrumbs :items="[{ title: 'Root', disabled: breadcrumbs.length === 0 }, ...breadcrumbs.map((crumb) => ({ title: crumb.name }))]">
        <template #item="{ item, index }">
          <a class="media-crumb" @click.prevent="goToCrumb(index - 1)">{{ item.title }}</a>
        </template>
      </v-breadcrumbs>
    </div>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-table class="media-table" density="comfortable">
      <thead>
        <tr>
          <th>{{ t('profile.media.name') }}</th>
          <th>{{ t('profile.media.type') }}</th>
          <th>{{ t('profile.media.size') }}</th>
          <th class="text-right">{{ t('profile.media.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="node in visibleNodes" :key="node.id">
          <td>
            <div class="d-flex align-center ga-2">
              <v-icon :icon="node.type === 'folder' ? 'mdi-folder' : fileIcon(node)" :color="node.type === 'folder' ? 'warning' : 'primary'" />
              <button
                v-if="node.type === 'folder'"
                type="button"
                class="media-link"
                @click="openFolder(node)"
              >
                {{ node.name }}
              </button>
              <span v-else>{{ node.name }}</span>
            </div>
          </td>
          <td>{{ node.type === 'folder' ? t('profile.media.folder') : (node.mimeType || t('profile.media.file')) }}</td>
          <td>{{ node.type === 'file' ? formatSize(node.size) : '-' }}</td>
          <td>
            <div class="d-flex justify-end ga-2">
              <v-btn
                v-if="node.type === 'file' && isImage(node)"
                size="small"
                variant="tonal"
                prepend-icon="mdi-image-search-outline"
                @click="openImagePreview(node)"
              >
                {{ t('profile.media.preview') }}
              </v-btn>
              <v-btn
                size="small"
                color="error"
                variant="text"
                prepend-icon="mdi-delete-outline"
                :loading="actionLoading"
                @click="deleteNode(node)"
              >
                {{ t('profile.media.delete') }}
              </v-btn>
            </div>
          </td>
        </tr>
        <tr v-if="!loading && visibleNodes.length === 0">
          <td colspan="4" class="text-center text-medium-emphasis py-8">{{ t('profile.media.empty') }}</td>
        </tr>
      </tbody>
    </v-table>

    <v-dialog v-model="createFolderDialog" max-width="420">
      <v-card>
        <v-card-title>{{ t('profile.media.createFolder') }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="createFolderName"
            :label="t('profile.media.folderName')"
            autofocus
            :disabled="actionLoading"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="actionLoading" @click="createFolderDialog = false">{{ t('common.cancel') }}</v-btn>
          <v-btn color="primary" :loading="actionLoading" @click="createFolder">{{ t('profile.media.create') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="imagePreviewDialog" max-width="900">
      <v-card>
        <v-card-title>{{ imagePreviewTitle }}</v-card-title>
        <v-card-text>
          <v-img :src="imagePreviewSrc" max-height="70vh" contain />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<style scoped>
.media-explorer {
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08) !important;
}

.media-table {
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.95) 0%, rgba(255, 255, 255, 1) 45%);
}

.media-link {
  border: none;
  background: transparent;
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
  font-weight: 600;
}

.media-link:hover,
.media-crumb:hover {
  text-decoration: underline;
}

.media-crumb {
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
}
</style>

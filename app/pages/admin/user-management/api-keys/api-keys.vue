<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { Notify } from '~/stores/notification'
import { useApiKeysStore } from '~/stores/apiKeys'
import { canManageApiKeys } from '~/utils/permissions/admin'
import type { AdminResourceSchema } from '~/types/admin-schema'
import { getAdminResourceDescriptor } from '~/services/admin/resource-descriptors'
import { buildSchemaColumns, buildSchemaFieldConfigs, normalizeAdminSchema } from '~/utils/admin/schema'

definePageMeta({
  icon: 'mdi-key-variant',
  title: 'Api keys',
  subtitle: 'Api keys Management Administration',
  drawerIndex: 74,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
  adminPermission: 'manageApiKeys',
})

const authStore = useAuthStore()
const apiKeysDescriptor = getAdminResourceDescriptor('apiKeys')
const apiKeysStore = useApiKeysStore()

const { roles } = storeToRefs(authStore)
const { rows, loading, busy, error, search, pagination, preferredVersion, activeVersion } = storeToRefs(apiKeysStore)

const page = computed({
  get: () => pagination.value.page,
  set: (value: number) => apiKeysStore.setPage(value),
})

const pageSize = computed({
  get: () => pagination.value.perPage,
  set: (value: number) => apiKeysStore.setPerPage(value),
})

const total = computed(() => pagination.value.total)
const filters = ref<Record<string, string>>({ version: preferredVersion.value })

const isRoot = computed(() => canManageApiKeys(roles.value))

const createOpen = ref(false)
const creating = ref(false)
const createForm = reactive({
  token: '',
  description: '',
  version: preferredVersion.value,
})

const fallbackColumns: DataTableHeader[] = [
  { title: 'Token', key: 'token' },
  { title: 'Description', key: 'description' },
]

const fallbackFields = [
  { key: 'token', label: 'Token' },
  { key: 'description', label: 'Description' },
]

const apiKeySchema = ref<AdminResourceSchema | null>(null)
const columns = computed<DataTableHeader[]>(() => buildSchemaColumns(apiKeySchema.value, fallbackColumns))
const detailFields = computed(() => buildSchemaFieldConfigs(apiKeySchema.value?.editable, fallbackFields))


async function loadSchema() {
  if (!apiKeysDescriptor.schemaEndpoint) {
    apiKeySchema.value = null
    return
  }

  try {
    const payload = await $fetch(String(apiKeysDescriptor.schemaEndpoint))
    apiKeySchema.value = normalizeAdminSchema(payload)
  } catch {
    apiKeySchema.value = null
  }
}

function createRow() {
  if (!isRoot.value) {
    return
  }

  createForm.token = ''
  createForm.description = ''
  createForm.version = filters.value.version || preferredVersion.value
  createOpen.value = true
}

async function submitCreateRow() {
  if (!createForm.token.trim()) {
    Notify.error('Token requis.')
    return
  }

  creating.value = true

  try {
    await apiKeysStore.createForVersion(createForm.version as 'v1' | 'v2', {
      token: createForm.token.trim(),
      description: createForm.description.trim(),
    })

    createOpen.value = false
    await apiKeysStore.refreshInventory()
  } finally {
    creating.value = false
  }
}

watch([page, pageSize], () => {
  void apiKeysStore.refreshInventory()
})

watchDebounced(search, () => {
  void apiKeysStore.refreshInventory()
}, { debounce: 300, maxWait: 1000 })

watch(() => filters.value.version, (version) => {
  const nextVersion = version === 'v1' ? 'v1' : 'v2'
  apiKeysStore.setPreferredVersion(nextVersion)
  createForm.version = nextVersion
  void apiKeysStore.refreshInventory()
})

onMounted(async () => {
  await authStore.ensureRolesLoaded()
  await loadSchema()
  await apiKeysStore.refreshInventory()
})
</script>

<template>
  <div>
    <AdminResourcePage
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :error="error"
      :total="total"
      :page="page"
      :page-size="pageSize"
      :search="search"
      :filters="filters"
      :filter-configs="[
        {
          key: 'version',
          label: 'Version API',
          icon: 'mdi-source-branch',
          items: [
            { title: 'v1', value: 'v1' },
            { title: 'v2', value: 'v2' },
          ],
        },
      ]"
      :detail-fields="detailFields"
      :editable-fields="detailFields"
      :can-show="isRoot"
      :can-create="isRoot"
      :can-edit="isRoot"
      :can-delete="isRoot"
      resource-name="la clé API"
      @update:page="page = $event"
      @update:page-size="pageSize = $event"
      @update:search="search = $event"
      @update:filters="filters = $event"
      @create="createRow"
      @save-edit="apiKeysStore.update(String(($event as any).id ?? ''), { token: String(($event as any).token ?? ''), description: String(($event as any).description ?? '') })"
      @row-delete="apiKeysStore.remove(String(($event as any).id ?? ''))"
      @refresh="apiKeysStore.refreshInventory"
    >
      <template #cell:description="{ value }">
        {{ value || '-' }}
      </template>
    </AdminResourcePage>

    <v-dialog v-model="createOpen" max-width="640">
      <v-card>
        <v-card-title>Créer une clé API</v-card-title>
        <v-card-subtitle>Version active: {{ activeVersion }}</v-card-subtitle>
        <v-card-text>
          <v-select
            v-model="createForm.version"
            label="Version"
            :items="[{ title: 'v1', value: 'v1' }, { title: 'v2', value: 'v2' }]"
            item-title="title"
            item-value="value"
            class="mb-2"
          />
          <v-text-field v-model="createForm.token" label="Token*" class="mb-2" />
          <v-textarea v-model="createForm.description" label="Description" rows="3" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="creating || busy" @click="createOpen = false">Annuler</v-btn>
          <v-btn color="primary" :loading="creating || busy" :disabled="creating || busy" @click="submitCreateRow">Créer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

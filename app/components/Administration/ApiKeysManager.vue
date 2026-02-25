<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { useInternalEventTracking } from '~/composables/useInternalEventTracking'
import type { Id } from '~~/services/admin/_shared'
import type {
  BaseApiKey,
  BaseCreateApiKeyRequest,
  BasePatchApiKeyRequest,
  BaseUpdateApiKeyRequest,
} from '~~/services/admin/apiKeys.shared'

interface ApiKeysService {
  list: (query?: { page?: number; pageSize?: number }) => Promise<unknown>
  count: () => Promise<unknown>
  ids: () => Promise<unknown>
  create: (payload: BaseCreateApiKeyRequest) => Promise<unknown>
  getById: (id: Id) => Promise<unknown>
  update: (id: Id, payload: BaseUpdateApiKeyRequest) => Promise<unknown>
  patch: (id: Id, payload: BasePatchApiKeyRequest) => Promise<unknown>
  remove: (id: Id) => Promise<unknown>
}

const props = defineProps<{
  version: 'v1' | 'v2'
  apiPrefix: `/api/${string}`
  service: ApiKeysService
  isRoot: boolean
}>()

const loading = ref(false)
const busy = ref(false)
const apiError = ref<string | null>(null)

const listRows = ref<BaseApiKey[]>([])
const totalCount = ref(0)
const ids = ref<string[]>([])
const selectedId = ref('')
const selectedItem = ref<BaseApiKey | null>(null)

const createForm = reactive({
  label: '',
  scopes: '',
  expiresAt: '',
})

const updateForm = reactive({
  label: '',
  scopes: '',
  enabled: true,
  expiresAt: '',
})

const patchForm = reactive({
  field: 'enabled',
  value: 'false',
})

const { track } = useInternalEventTracking()

function ensureRoot() {
  if (props.isRoot) {
    return true
  }

  Notify.error('Action réservée aux utilisateurs ROLE_ROOT.')
  return false
}

function parseScopes(value: string) {
  return value
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean)
}

function normalizeList(payload: unknown): BaseApiKey[] {
  if (Array.isArray(payload)) {
    return payload as BaseApiKey[]
  }

  if (payload && typeof payload === 'object') {
    const data = (payload as { data?: unknown }).data
    const items = (payload as { items?: unknown }).items

    if (Array.isArray(data)) {
      return data as BaseApiKey[]
    }

    if (Array.isArray(items)) {
      return items as BaseApiKey[]
    }
  }

  return []
}

function normalizeCount(payload: unknown, fallback: number) {
  if (typeof payload === 'number') {
    return payload
  }

  if (payload && typeof payload === 'object' && 'count' in payload) {
    return Number((payload as { count: unknown }).count)
  }

  return fallback
}

function toErrorMessage(error: unknown): string {
  if (isError(error) && error.statusCode === 403) {
    return 'Accès refusé (403) : vous n’avez pas les permissions nécessaires pour cette action.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Une erreur API est survenue.'
}

async function loadInventory() {
  loading.value = true
  apiError.value = null

  try {
    const [listResponse, countResponse, idsResponse] = await Promise.all([
      props.service.list({ page: 1, pageSize: 20 }),
      props.service.count(),
      props.service.ids(),
    ])

    listRows.value = normalizeList(listResponse)
    totalCount.value = normalizeCount(countResponse, listRows.value.length)
    ids.value = Array.isArray(idsResponse) ? idsResponse.map(String) : []

    if (!selectedId.value && ids.value.length > 0) {
      selectedId.value = ids.value[0]!
    }
  } catch (error) {
    apiError.value = toErrorMessage(error)
    Notify.error(apiError.value)
  } finally {
    loading.value = false
  }
}

async function createApiKey() {
  if (!ensureRoot()) {
    return
  }

  busy.value = true

  try {
    const payload: BaseCreateApiKeyRequest = {
      label: createForm.label.trim(),
      scopes: parseScopes(createForm.scopes),
      expiresAt: createForm.expiresAt || null,
    }

    await props.service.create(payload)
    track({
      name: 'api-keys.create',
      payload: {
        version: props.version,
        prefix: props.apiPrefix,
        label: payload.label,
      },
    })

    Notify.success(`Clé API ${props.version} créée.`)
    await loadInventory()
  } catch (error) {
    Notify.error(toErrorMessage(error))
  } finally {
    busy.value = false
  }
}

async function fetchById() {
  if (!ensureRoot() || !selectedId.value) {
    return
  }

  busy.value = true

  try {
    const response = await props.service.getById(selectedId.value)
    selectedItem.value = response as BaseApiKey
    Notify.success(`Détail récupéré pour ${selectedId.value}.`)
  } catch (error) {
    Notify.error(toErrorMessage(error))
  } finally {
    busy.value = false
  }
}

async function updateById() {
  if (!ensureRoot() || !selectedId.value) {
    return
  }

  busy.value = true

  try {
    await props.service.update(selectedId.value, {
      label: updateForm.label.trim() || undefined,
      scopes: parseScopes(updateForm.scopes),
      enabled: updateForm.enabled,
      expiresAt: updateForm.expiresAt || null,
    })

    Notify.success(`Clé ${selectedId.value} mise à jour (PUT).`)
    await loadInventory()
  } catch (error) {
    Notify.error(toErrorMessage(error))
  } finally {
    busy.value = false
  }
}

async function patchById() {
  if (!ensureRoot() || !selectedId.value) {
    return
  }

  busy.value = true

  try {
    const value =
      patchForm.field === 'enabled'
        ? patchForm.value === 'true'
        : patchForm.value

    await props.service.patch(selectedId.value, {
      [patchForm.field]: value,
    })

    Notify.success(`Clé ${selectedId.value} mise à jour (PATCH).`)
    await loadInventory()
  } catch (error) {
    Notify.error(toErrorMessage(error))
  } finally {
    busy.value = false
  }
}

async function removeById() {
  if (!ensureRoot() || !selectedId.value) {
    return
  }

  busy.value = true

  try {
    await props.service.remove(selectedId.value)
    track({
      name: 'api-keys.delete',
      payload: {
        version: props.version,
        prefix: props.apiPrefix,
        id: selectedId.value,
      },
    })

    Notify.success(`Clé ${selectedId.value} supprimée.`)
    selectedId.value = ''
    selectedItem.value = null
    await loadInventory()
  } catch (error) {
    Notify.error(toErrorMessage(error))
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  await loadInventory()
})
</script>

<template>
  <v-card variant="tonal" rounded="lg" class="pa-4">
    <div class="d-flex justify-space-between align-center flex-wrap ga-2 mb-3">
      <div>
        <div class="text-overline">
          {{ version.toUpperCase() }} · {{ apiPrefix }}
        </div>
        <div class="text-h6">Gestion API keys</div>
      </div>
      <v-chip color="error" size="small" variant="tonal">ROOT only</v-chip>
    </div>

    <PermissionGate
      :allowed="isRoot"
      mode="alert"
      message="Toutes les opérations sont bloquées sans le rôle ROLE_ROOT."
      class="mb-3"
    />

    <AdminPageError :message="apiError" />

    <div class="d-flex align-center ga-2 mb-4 flex-wrap">
      <v-btn
        color="primary"
        prepend-icon="mdi-refresh"
        :loading="loading"
        @click="loadInventory"
      >
        Recharger list/count/ids
      </v-btn>
      <span class="text-caption text-medium-emphasis">
        count: {{ totalCount }} · ids: {{ ids.length }}
      </span>
    </div>

    <v-row dense>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="createForm.label"
          label="Create · label"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="createForm.scopes"
          label="Create · scopes (csv)"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="createForm.expiresAt"
          label="Create · expiresAt (ISO)"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="6" class="d-flex align-center">
        <v-btn
          v-if="isRoot"
          color="primary"
          :loading="busy"
          @click="createApiKey"
          >Create</v-btn
        >
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-select
      v-model="selectedId"
      :items="ids"
      label="ID cible"
      density="comfortable"
      clearable
      class="mb-2"
    />

    <div class="d-flex ga-2 flex-wrap mb-4">
      <v-btn
        v-if="isRoot"
        :disabled="!selectedId"
        :loading="busy"
        @click="fetchById"
        >getById</v-btn
      >
      <v-btn
        v-if="isRoot"
        :disabled="!selectedId"
        :loading="busy"
        @click="removeById"
        >delete</v-btn
      >
    </div>

    <v-row dense>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="updateForm.label"
          label="Update · label"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="updateForm.scopes"
          label="Update · scopes (csv)"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-switch
          v-model="updateForm.enabled"
          label="Update · enabled"
          inset
          hide-details
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="updateForm.expiresAt"
          label="Update · expiresAt"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="4" class="d-flex align-center">
        <v-btn
          v-if="isRoot"
          :disabled="!selectedId"
          :loading="busy"
          @click="updateById"
          >update</v-btn
        >
      </v-col>
    </v-row>

    <v-row dense class="mt-2">
      <v-col cols="12" md="4">
        <v-select
          v-model="patchForm.field"
          :items="['label', 'enabled', 'expiresAt']"
          label="Patch · field"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="patchForm.value"
          label="Patch · value"
          density="comfortable"
        />
      </v-col>
      <v-col cols="12" md="4" class="d-flex align-center">
        <v-btn
          v-if="isRoot"
          :disabled="!selectedId"
          :loading="busy"
          @click="patchById"
          >patch</v-btn
        >
      </v-col>
    </v-row>

    <v-card v-if="selectedItem" variant="outlined" rounded="lg" class="mt-4">
      <v-card-title class="text-subtitle-2">Réponse getById</v-card-title>
      <v-card-text>
        <pre class="text-caption">{{
          JSON.stringify(selectedItem, null, 2)
        }}</pre>
      </v-card-text>
    </v-card>
  </v-card>
</template>

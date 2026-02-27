<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'

import AdminCard from '~/components/admin/ui/AdminCard.vue'

type AdminRow = Record<string, unknown>

type FilterConfig = {
  key: string
  label: string
  icon?: string
  items?: { title: string; value: string }[]
}

type FieldConfig = {
  key: string
  label: string
}

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    columns: DataTableHeader[]
    rows: AdminRow[]
    loading?: boolean
    error?: string | null
    total?: number
    page?: number
    pageSize?: number
    sortBy?: readonly { key: string; order?: 'asc' | 'desc' | boolean }[]
    search?: string
    filters?: Record<string, string>
    filterConfigs?: FilterConfig[]
    detailFields?: FieldConfig[]
    editableFields?: FieldConfig[]
    createLabel?: string
    canCreate?: boolean
    canShow?: boolean
    canEdit?: boolean
    canDelete?: boolean
    resourceName?: string
    detailRouteBase?: string
    mutationLoading?: boolean
  }>(),
  {
    title: undefined,
    description: '',
    loading: false,
    error: null,
    total: 0,
    page: 1,
    pageSize: 10,
    sortBy: () => [],
    search: '',
    filters: () => ({}),
    filterConfigs: () => [],
    detailFields: () => [],
    editableFields: () => [],
    createLabel: 'Créer',
    canCreate: false,
    canShow: true,
    canEdit: false,
    canDelete: false,
    resourceName: 'élément',
    detailRouteBase: undefined,
    mutationLoading: false,
  },
)

const emit = defineEmits<{
  'update:page': [value: number]
  'update:pageSize': [value: number]
  'update:sortBy': [value: readonly { key: string; order?: 'asc' | 'desc' | boolean }[]]
  'update:search': [value: string]
  'update:filters': [value: Record<string, string>]
  create: []
  'row-show': [row: AdminRow]
  'row-edit': [row: AdminRow]
  'row-delete': [row: AdminRow]
  'save-edit': [row: AdminRow]
  refresh: []
}>()

const detailDialogOpen = ref(false)
const editOpen = ref(false)
const selectedRow = ref<AdminRow | null>(null)
const editableRow = ref<AdminRow | null>(null)
const isMounted = ref(false)
const hasAppBarTarget = ref(false)

const { mdAndUp } = useDisplay()

const dialogDelete = useTemplateRef('dialogDelete')

const localSearch = computed({
  get: () => props.search,
  set: (value: string) => emit('update:search', value),
})

const canTeleportControls = computed(
  () => isMounted.value && mdAndUp.value && hasAppBarTarget.value,
)

const appBarGridStyle = computed(() => ({
  gridTemplateColumns: `minmax(220px, 1.4fr) repeat(${props.filterConfigs.length}, minmax(150px, 1fr)) auto`,
}))

function updateAppBarTargetPresence() {
  if (import.meta.server) {
    hasAppBarTarget.value = false
    return
  }

  hasAppBarTarget.value = Boolean(document.querySelector('#app-bar'))
}

function setFilter(key: string, value: string) {
  emit('update:filters', {
    ...props.filters,
    [key]: value,
  })
}

function openDetails(row: AdminRow) {
  if (!props.canShow) {
    return
  }

  selectedRow.value = row
  detailDialogOpen.value = true
  emit('row-show', row)
}

function openEdit(row: AdminRow) {
  if (!props.canEdit) {
    return
  }

  editableRow.value = { ...row }
  editOpen.value = true
  emit('row-edit', row)
}

async function confirmDelete(row: AdminRow) {
  if (!props.canDelete || props.mutationLoading) {
    return
  }

  const identifier = String(row.username ?? row.name ?? row.email ?? row.id ?? '').trim()
  const requiresTypedConfirmation = Boolean(identifier)
  const confirmed = await dialogDelete.value?.open(
    `Supprimer ${props.resourceName} ${identifier || ''} ?`,
    requiresTypedConfirmation
      ? {
          confirmationLabel: `Saisissez ${identifier} pour confirmer la suppression`,
          expectedConfirmationText: identifier,
        }
      : undefined,
  )

  if (!confirmed) {
    return
  }

  emit('row-delete', row)
}

function saveEdit() {
  if (!editableRow.value) {
    return
  }

  emit('save-edit', editableRow.value)
  editOpen.value = false
}

onMounted(() => {
  isMounted.value = true
  updateAppBarTargetPresence()
})
</script>

<template>
  <AdminCard>
    <client-only>
      <teleport v-if="canTeleportControls" to="#app-bar">
        <div class="admin-resource-controls app-bar-controls-grid" :style="appBarGridStyle">
          <v-text-field
            v-model="localSearch"
            placeholder="Recherche"
            prepend-inner-icon="mdi-magnify"
            hide-details
            density="compact"
            variant="outlined"
            clearable
          />
          <component
            :is="filter.items?.length ? 'v-select' : 'v-text-field'"
            v-for="filter in filterConfigs"
            :key="filter.key"
            :model-value="filters[filter.key] || ''"
            :label="filter.label"
            :prepend-inner-icon="filter.icon"
            :items="filter.items"
            item-title="title"
            item-value="value"
            hide-details
            density="compact"
            variant="outlined"
            clearable
            @update:model-value="setFilter(filter.key, String($event || ''))"
          />
          <div class="admin-resource-controls__actions d-flex ga-2 justify-end">
            <v-btn
              icon="mdi-refresh"
              color="primary"
              variant="text"
              size="small"
              aria-label="Actualiser"
              @click="emit('refresh')"
            />
            <v-btn
              v-if="canCreate"
              color="primary"
              prepend-icon="mdi-plus"
              size="small"
              @click="emit('create')"
            >
              New
            </v-btn>
          </div>
        </div>
      </teleport>
    </client-only>

    <AdminTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :error="error"
      :total="total"
      :page="page"
      :page-size="pageSize"
      :sort-by="sortBy"
      @update:page="emit('update:page', $event)"
      @update:page-size="emit('update:pageSize', $event)"
      @sort-change="emit('update:sortBy', $event)"
      @row-click="openDetails"
    >
      <template #toolbar>
        <div v-if="!canTeleportControls" class="admin-resource-controls local-controls-grid mb-2">
          <v-text-field
            v-model="localSearch"
            placeholder="Recherche"
            prepend-inner-icon="mdi-magnify"
            hide-details
            density="compact"
            variant="outlined"
            clearable
          />
          <component
            :is="filter.items?.length ? 'v-select' : 'v-text-field'"
            v-for="filter in filterConfigs"
            :key="filter.key"
            :model-value="filters[filter.key] || ''"
            :label="filter.label"
            :prepend-inner-icon="filter.icon"
            :items="filter.items"
            item-title="title"
            item-value="value"
            hide-details
            density="compact"
            variant="outlined"
            clearable
            @update:model-value="setFilter(filter.key, String($event || ''))"
          />
          <div class="admin-resource-controls__actions d-flex ga-2 justify-end">
            <v-btn
              icon="mdi-refresh"
              color="primary"
              variant="text"
              size="small"
              aria-label="Actualiser"
              @click="emit('refresh')"
            />
            <v-btn
              v-if="canCreate"
              color="primary"
              prepend-icon="mdi-plus"
              size="small"
              @click="emit('create')"
            >
              New
            </v-btn>
          </div>
        </div>
      </template>

      <template #row-actions="{ item }">
        <v-btn
          v-if="canShow"
          size="small"
          icon="mdi-eye-outline"
          variant="text"
          color="info"
          @click.stop="openDetails(item)"
        />

        <v-btn
          v-if="detailRouteBase && item.id"
          size="small"
          icon="mdi-open-in-new"
          variant="text"
          color="secondary"
          :to="`${detailRouteBase}/${encodeURIComponent(String(item.id))}`"
        />
        <v-btn
          v-if="canEdit"
          size="small"
          icon="mdi-pencil-outline"
          variant="text"
          color="warning"
          :disabled="!canEdit || mutationLoading"
          :loading="mutationLoading"
          @click.stop="openEdit(item)"
        />
        <v-btn
          v-if="canDelete"
          size="small"
          icon="mdi-delete-outline"
          variant="text"
          color="error"
          :disabled="!canDelete || mutationLoading"
          :loading="mutationLoading"
          @click.stop="confirmDelete(item)"
        />
      </template>

      <template
        v-for="column in columns"
        :key="`resource-cell-${String(column.key)}`"
        #[`cell:${String(column.key)}`]="slotProps"
      >
        <slot :name="`cell:${String(column.key)}`" v-bind="slotProps" />
      </template>
    </AdminTable>

    <DialogConfirm ref="dialogDelete" />

    <v-dialog v-model="detailDialogOpen" max-width="900">
      <v-card>
        <v-card-title>Détails</v-card-title>
        <v-card-text>
          <slot name="detail-content" :row="selectedRow">
            <v-list v-if="selectedRow" lines="two" density="comfortable">
              <v-list-item
                v-for="field in detailFields"
                :key="field.key"
                :title="field.label"
                :subtitle="String(selectedRow[field.key] ?? '-')"
              />
            </v-list>
          </slot>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="detailDialogOpen = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editOpen" max-width="820">
      <v-card v-if="editableRow">
        <v-card-title>Éditer {{ resourceName }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-for="field in editableFields"
            :key="field.key"
            v-model="editableRow[field.key]"
            :label="field.label"
            class="mb-2"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="editOpen = false">Annuler</v-btn>
          <v-btn color="primary" :loading="mutationLoading" :disabled="mutationLoading" @click="saveEdit">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AdminCard>
</template>

<style scoped>
.admin-resource-controls {
  display: grid;
  gap: 8px;
}

.local-controls-grid {
  grid-template-columns: repeat(12, minmax(0, 1fr));
}

.local-controls-grid > :first-child {
  grid-column: span 12;
}

.local-controls-grid > :not(:first-child):not(.admin-resource-controls__actions) {
  grid-column: span 12;
}

.local-controls-grid .admin-resource-controls__actions {
  grid-column: span 12;
}

.app-bar-controls-grid {
  width: min(640px, 100%);
  margin-left: auto;
  align-items: center;
  gap: 6px;
}



.app-bar-controls-grid :deep(.v-input) {
  min-width: 200px;
}

.app-bar-controls-grid :deep(.v-field) {
  border-radius: 10px;
}

.app-bar-controls-grid .admin-resource-controls__actions {
  white-space: nowrap;
}

.app-bar-controls-grid :deep(.v-field__input) {
  min-height: 38px;
  padding-top: 0;
  padding-bottom: 0;
}

@media (min-width: 960px) {
  .local-controls-grid > :first-child {
    grid-column: span 5;
  }

  .local-controls-grid > :not(:first-child):not(.admin-resource-controls__actions) {
    grid-column: span 3;
  }

  .local-controls-grid .admin-resource-controls__actions {
    grid-column: span 4;
  }
}
</style>

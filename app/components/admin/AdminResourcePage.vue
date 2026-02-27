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
  type?: 'normal' | 'string' | 'int' | 'date' | 'image' | 'boolean' | 'object'
  endpoint?: string
  targetClass?: string
  readonly?: boolean
  patchable?: boolean
}

type RowPatchPayload = {
  rowId: string
  field: string
  value: boolean
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
    rowPatchLoadingKeys?: string[]
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
    rowPatchLoadingKeys: () => [],
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
  'row-patch': [payload: RowPatchPayload]
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


const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const fieldConfigByKey = computed(() => {
  const configs = [...props.detailFields, ...props.editableFields]
  return configs.reduce<Record<string, FieldConfig>>((acc, config) => {
    if (!acc[config.key]) {
      acc[config.key] = config
    }

    return acc
  }, {})
})

const rowPatchLoadingSet = computed(() => new Set(props.rowPatchLoadingKeys))
const exportingExcel = ref(false)
const exportingPdf = ref(false)

const exportableColumns = computed(() =>
  props.columns
    .map((column) => ({
      key: String(column.key),
      title: String(column.title ?? column.key ?? ''),
    }))
    .filter((column) => column.key && column.key !== 'id' && column.key !== 'actions'),
)

function getFieldType(key: string) {
  return fieldConfigByKey.value[key]?.type ?? 'normal'
}

function getObjectDisplayLabel(value: unknown) {
  if (!value || typeof value !== 'object') {
    return String(value ?? '-').trim() || '-'
  }

  const candidate = value as Record<string, unknown>
  return String(candidate.label ?? candidate.name ?? candidate.title ?? candidate.id ?? '-').trim() || '-'
}

function getDisplayValue(value: unknown, type: FieldConfig['type']) {
  if (value == null || value === '') {
    return '-'
  }

  if (type === 'date') {
    const parsedDate = new Date(String(value))
    return Number.isNaN(parsedDate.getTime()) ? String(value) : dateFormatter.format(parsedDate)
  }

  if (type === 'object') {
    if (Array.isArray(value)) {
      return value.map((item) => getObjectDisplayLabel(item)).join(', ')
    }

    return getObjectDisplayLabel(value)
  }

  return String(value)
}

function normalizeBooleanValue(value: unknown) {
  return Boolean(value)
}

function getRowPatchKey(rowId: string, field: string) {
  return `${rowId}:${field}`
}

function isRowPatchLoading(rowId: string, field: string) {
  return rowPatchLoadingSet.value.has(getRowPatchKey(rowId, field))
}

function emitRowPatch(item: AdminRow, field: string, value: unknown) {
  const rowId = String(item.id ?? '').trim()
  if (!rowId || isRowPatchLoading(rowId, field)) {
    return
  }

  emit('row-patch', {
    rowId,
    field,
    value: Boolean(value),
  })
}

function getObjectList(value: unknown) {
  return Array.isArray(value) ? value : []
}

function toNumericValue(value: unknown) {
  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? null : numericValue
}

function updateEditableValue(field: FieldConfig, value: unknown) {
  if (!editableRow.value || field.readonly || field.patchable === false) {
    return
  }

  editableRow.value[field.key] = value
}

function isFieldDisabled(field: FieldConfig) {
  return field.readonly || field.patchable === false || props.mutationLoading
}

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

function getExportFilename(extension: 'xlsx' | 'pdf') {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  return `admin-table-${timestamp}.${extension}`
}

function getExportRows() {
  return props.rows.map((row) =>
    exportableColumns.value.map((column) => {
      const value = row[column.key]
      if (value == null) {
        return ''
      }

      if (typeof value === 'object') {
        return JSON.stringify(value)
      }

      return String(value)
    }),
  )
}

async function exportToExcel() {
  if (exportingExcel.value || !props.rows.length) {
    return
  }

  try {
    exportingExcel.value = true

    const headers = exportableColumns.value.map((column) => column.title)
    const rows = getExportRows()
    const escapeCell = (value: string) => `"${value.replaceAll('"', '""')}"`
    const csvContent = [headers, ...rows]
      .map((line) => line.map((cell) => escapeCell(cell)).join(';'))
      .join('\n')

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = getExportFilename('xlsx').replace('.xlsx', '.csv')
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(link.href)
  }
  finally {
    exportingExcel.value = false
  }
}

async function exportToPdf() {
  if (exportingPdf.value || !props.rows.length || import.meta.server) {
    return
  }

  try {
    exportingPdf.value = true

    const printWindow = window.open('', '_blank', 'noopener,noreferrer')
    if (!printWindow) {
      return
    }

    const headers = exportableColumns.value.map((column) => `<th>${column.title}</th>`).join('')
    const body = getExportRows()
      .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
      .join('')

    printWindow.document.write(`
      <html>
        <head>
          <title>Export PDF</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h2>Export table</h2>
          <table>
            <thead><tr>${headers}</tr></thead>
            <tbody>${body}</tbody>
          </table>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }
  finally {
    exportingPdf.value = false
  }
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
              color="success"
              variant="text"
              prepend-icon="mdi-file-excel"
              size="small"
              :disabled="!rows.length"
              :loading="exportingExcel"
              @click="exportToExcel"
            >
              Excel
            </v-btn>
            <v-btn
              color="error"
              variant="text"
              prepend-icon="mdi-file-pdf-box"
              size="small"
              :disabled="!rows.length"
              :loading="exportingPdf"
              @click="exportToPdf"
            >
              PDF
            </v-btn>
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
              color="success"
              variant="text"
              prepend-icon="mdi-file-excel"
              size="small"
              :disabled="!rows.length"
              :loading="exportingExcel"
              @click="exportToExcel"
            >
              Excel
            </v-btn>
            <v-btn
              color="error"
              variant="text"
              prepend-icon="mdi-file-pdf-box"
              size="small"
              :disabled="!rows.length"
              :loading="exportingPdf"
              @click="exportToPdf"
            >
              PDF
            </v-btn>
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
        <slot :name="`cell:${String(column.key)}`" v-bind="slotProps">
          <template v-if="getFieldType(String(column.key)) === 'image'">
            <v-avatar size="38" rounded="lg">
              <v-img :src="String(slotProps.item[String(column.key)] ?? '')" cover />
            </v-avatar>
          </template>

          <v-switch
            v-else-if="getFieldType(String(column.key)) === 'boolean'"
            :model-value="normalizeBooleanValue(slotProps.item[String(column.key)])"
            :loading="isRowPatchLoading(String(slotProps.item.id ?? ''), String(column.key))"
            :disabled="isRowPatchLoading(String(slotProps.item.id ?? ''), String(column.key))"
            density="compact"
            color="primary"
            hide-details
            inset
            @click.stop
            @update:model-value="emitRowPatch(slotProps.item, String(column.key), $event)"
          />

          <template v-else-if="getFieldType(String(column.key)) === 'object'">
            <div
              v-if="Array.isArray(slotProps.item[String(column.key)])"
              class="d-flex flex-wrap ga-1"
            >
              <v-chip
                v-for="relation in getObjectList(slotProps.item[String(column.key)])"
                :key="getObjectDisplayLabel(relation)"
                size="small"
                variant="tonal"
              >
                {{ getObjectDisplayLabel(relation) }}
              </v-chip>
            </div>
            <v-chip v-else size="small" variant="tonal">
              {{ getObjectDisplayLabel(slotProps.item[String(column.key)]) }}
            </v-chip>
          </template>

          <span v-else>
            {{ getDisplayValue(slotProps.item[String(column.key)], getFieldType(String(column.key))) }}
          </span>
        </slot>
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
          <template
            v-for="field in editableFields"
            :key="`edit-field-${field.key}`"
          >
            <v-switch
              v-if="field.type === 'boolean'"
              :model-value="normalizeBooleanValue(editableRow[field.key])"
              :label="field.label"
              :disabled="isFieldDisabled(field)"
              color="primary"
              class="mb-2"
              hide-details
              inset
              @update:model-value="updateEditableValue(field, $event)"
            />

            <v-text-field
              v-else-if="field.type === 'date'"
              :model-value="String(editableRow[field.key] ?? '')"
              :label="field.label"
              :disabled="isFieldDisabled(field)"
              type="datetime-local"
              class="mb-2"
              @update:model-value="updateEditableValue(field, $event)"
            />

            <div v-else-if="field.type === 'image'" class="mb-2">
              <v-text-field
                :model-value="String(editableRow[field.key] ?? '')"
                :label="field.label"
                :disabled="isFieldDisabled(field)"
                @update:model-value="updateEditableValue(field, $event)"
              />
              <v-avatar size="52" rounded="lg" class="mt-1">
                <v-img :src="String(editableRow[field.key] ?? '')" cover />
              </v-avatar>
            </div>

            <v-text-field
              v-else-if="field.type === 'int'"
              :model-value="editableRow[field.key] ?? ''"
              :label="field.label"
              :disabled="isFieldDisabled(field)"
              type="number"
              class="mb-2"
              @update:model-value="updateEditableValue(field, toNumericValue($event))"
            />

            <v-textarea
              v-else-if="field.type === 'object'"
              :model-value="getDisplayValue(editableRow[field.key], 'object')"
              :label="field.label"
              readonly
              class="mb-2"
              hint="Relation affichée en lecture seule"
              persistent-hint
            />

            <v-text-field
              v-else
              :model-value="String(editableRow[field.key] ?? '')"
              :label="field.label"
              :disabled="isFieldDisabled(field)"
              class="mb-2"
              @update:model-value="updateEditableValue(field, $event)"
            />
          </template>
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

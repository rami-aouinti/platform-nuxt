<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'

type AdminRow = Record<string, unknown>

type FilterConfig = {
  key: string
  label: string
  icon?: string
}

type FieldConfig = {
  key: string
  label: string
}

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    columns: DataTableHeader[]
    rows: AdminRow[]
    loading?: boolean
    error?: string | null
    total?: number
    page?: number
    pageSize?: number
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
  }>(),
  {
    description: '',
    loading: false,
    error: null,
    total: 0,
    page: 1,
    pageSize: 10,
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
  },
)

const emit = defineEmits<{
  'update:page': [value: number]
  'update:pageSize': [value: number]
  'update:search': [value: string]
  'update:filters': [value: Record<string, string>]
  create: []
  'row-show': [row: AdminRow]
  'row-edit': [row: AdminRow]
  'row-delete': [row: AdminRow]
  'save-edit': [row: AdminRow]
  refresh: []
}>()

const detailOpen = ref(false)
const editOpen = ref(false)
const selectedRow = ref<AdminRow | null>(null)
const editableRow = ref<AdminRow | null>(null)

const dialogDelete = useTemplateRef('dialogDelete')

const localSearch = computed({
  get: () => props.search,
  set: (value: string) => emit('update:search', value),
})

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
  detailOpen.value = true
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
  if (!props.canDelete) {
    return
  }

  const identifier = String(row.name ?? row.username ?? row.email ?? row.id ?? '')
  const confirmed = await dialogDelete.value?.open(
    `Supprimer ${props.resourceName} ${identifier} ?`,
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
</script>

<template>
  <AdminCard>
    <AdminToolbar :title="title" :description="description">
      <template #actions>
        <v-btn
          v-if="canCreate"
          color="primary"
          prepend-icon="mdi-plus"
          @click="emit('create')"
        >
          {{ createLabel }}
        </v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" @click="emit('refresh')">
          Recharger
        </v-btn>
      </template>
    </AdminToolbar>

    <AdminTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :error="error"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @update:page="emit('update:page', $event)"
      @update:page-size="emit('update:pageSize', $event)"
      @row-click="openDetails"
    >
      <template #toolbar>
        <v-row dense class="mb-2">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="localSearch"
              label="Recherche"
              prepend-inner-icon="mdi-magnify"
              hide-details
              clearable
            />
          </v-col>
          <v-col
            v-for="filter in filterConfigs"
            :key="filter.key"
            cols="12"
            md="4"
          >
            <v-text-field
              :model-value="filters[filter.key] || ''"
              :label="filter.label"
              :prepend-inner-icon="filter.icon"
              hide-details
              clearable
              @update:model-value="setFilter(filter.key, String($event || ''))"
            />
          </v-col>
        </v-row>
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
          size="small"
          icon="mdi-pencil-outline"
          variant="text"
          color="warning"
          :disabled="!canEdit"
          @click.stop="openEdit(item)"
        />
        <v-btn
          size="small"
          icon="mdi-delete-outline"
          variant="text"
          color="error"
          :disabled="!canDelete"
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

    <v-navigation-drawer
      v-model="detailOpen"
      location="right"
      temporary
      width="420"
    >
      <v-toolbar title="Détail" color="primary" density="comfortable" />
      <v-list v-if="selectedRow" lines="two">
        <v-list-item
          v-for="field in detailFields"
          :key="field.key"
          :title="field.label"
          :subtitle="String(selectedRow[field.key] ?? '-')"
        />
      </v-list>
    </v-navigation-drawer>

    <v-dialog v-model="editOpen" max-width="640">
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
          <v-btn color="primary" @click="saveEdit">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AdminCard>
</template>

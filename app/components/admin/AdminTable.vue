<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'

import AdminEmptyState from '~/components/admin/ui/AdminEmptyState.vue'
import AdminErrorState from '~/components/admin/ui/AdminErrorState.vue'

type AdminRow = Record<string, unknown>

const props = withDefaults(
  defineProps<{
    columns: DataTableHeader[]
    rows?: AdminRow[]
    loading?: boolean
    total?: number
    page?: number
    pageSize?: number
    selectable?: boolean
    error?: string | null
    emptyTitle?: string
    emptyMessage?: string
  }>(),
  {
    rows: () => [],
    loading: false,
    total: 0,
    page: 1,
    pageSize: 10,
    selectable: false,
    error: null,
    emptyTitle: 'Aucun résultat',
    emptyMessage: 'Aucune donnée ne correspond aux filtres en cours.',
  },
)

const emit = defineEmits<{
  'update:page': [value: number]
  'update:pageSize': [value: number]
  'sort-change': [value: readonly { key: string; order?: 'asc' | 'desc' | boolean }[]]
  'row-click': [row: AdminRow]
}>()

const normalizedColumns = computed(() =>
  props.columns.map((column) => ({
    ...column,
    key: String(column.key),
  })),
)

const hasActionsSlot = computed(() => Boolean(useSlots()['row-actions']))

const headers = computed<DataTableHeader[]>(() => {
  if (!hasActionsSlot.value) {
    return normalizedColumns.value
  }

  const hasActionColumn = normalizedColumns.value.some(
    (column) => column.key === 'actions',
  )

  if (hasActionColumn) {
    return normalizedColumns.value
  }

  return [
    ...normalizedColumns.value,
    {
      title: 'Actions',
      key: 'actions',
      sortable: false,
      align: 'end',
      width: 140,
    },
  ]
})

const totalRows = computed(() => props.total ?? props.rows.length)

function getCellValue(row: AdminRow, columnKey: string) {
  return row[columnKey]
}

function onClickRow(_: MouseEvent, payload: { item?: AdminRow }) {
  if (!payload.item) {
    return
  }

  emit('row-click', payload.item)
}

function onKeydownRow(event: KeyboardEvent, row: AdminRow) {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return
  }

  event.preventDefault()
  emit('row-click', row)
}

function getRowProps(payload: { item: AdminRow }) {
  const rowId = String(payload.item.id ?? '')

  return {
    tabindex: 0,
    role: 'button',
    class: 'admin-table__row',
    'aria-label': `Ouvrir la ligne ${rowId}`,
    onKeydown: (event: KeyboardEvent) => onKeydownRow(event, payload.item),
  }
}
</script>

<template>
  <div class="admin-table">
    <div v-if="$slots.toolbar" class="mb-4">
      <slot name="toolbar" />
    </div>

    <AdminErrorState v-if="error" :message="error" class="my-6" :can-retry="false" />

    <v-data-table-server
      v-else
      :headers="headers"
      :items="rows"
      :items-length="totalRows"
      item-value="id"
      :loading="loading"
      :show-select="selectable"
      :page="page"
      :items-per-page="pageSize"
      :row-props="getRowProps"
      hover
      class="admin-table__datatable"
      @update:page="emit('update:page', $event)"
      @update:items-per-page="emit('update:pageSize', $event)"
      @update:sort-by="emit('sort-change', $event)"
      @click:row="onClickRow"
    >
      <template #loading>
        <v-skeleton-loader
          type="table-heading, table-row@6"
          aria-label="Chargement des données du tableau d'administration"
        />
      </template>

      <template #no-data>
        <AdminEmptyState :title="emptyTitle" :message="emptyMessage" />
      </template>

      <template
        v-for="column in normalizedColumns"
        :key="`cell-${column.key}`"
        #[`item.${column.key}`]="slotProps"
      >
        <slot
          :name="`cell:${column.key}`"
          v-bind="slotProps"
          :item="slotProps.item"
          :value="getCellValue(slotProps.item, String(column.key))"
        >
          {{ getCellValue(slotProps.item, String(column.key)) }}
        </slot>
      </template>

      <template v-if="$slots['row-actions']" #item.actions="slotProps">
        <div class="d-flex justify-end ga-1">
          <slot name="row-actions" v-bind="slotProps" :item="slotProps.item" />
        </div>
      </template>

      <template #item.data-table-select="{ internalItem, isSelected, toggleSelect }">
        <v-checkbox-btn
          :model-value="isSelected([internalItem])"
          color="primary"
          :aria-label="`Sélectionner la ligne ${String(internalItem.value ?? '')}`"
          @click.stop="toggleSelect(internalItem)"
        />
      </template>

    </v-data-table-server>
  </div>
</template>

<style scoped>
:deep(.admin-table__datatable .v-data-table-footer) {
  padding: 0.75rem 1rem;
}

:deep(.admin-table__datatable .v-data-table-footer__items-per-page) {
  margin-inline-end: 0.5rem;
}

@media (max-width: 959px) {
  :deep(.admin-table__datatable .v-data-table-footer) {
    display: grid;
    grid-template-columns: 1fr;
    row-gap: 0.5rem;
    justify-items: center;
  }

  :deep(.admin-table__datatable .v-data-table-footer__items-per-page),
  :deep(.admin-table__datatable .v-data-table-footer__info),
  :deep(.admin-table__datatable .v-data-table-footer__pagination) {
    margin: 0;
    justify-content: center;
  }
}
</style>

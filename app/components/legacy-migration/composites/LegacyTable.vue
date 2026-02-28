<template>
  <v-card class="card-shadow mb-6">
    <v-card-title class="text-h6 d-flex align-center justify-space-between">
      <span>{{ title }}</span>
      <v-text-field
        v-if="searchable"
        v-model="search"
        hide-details
        dense
        flat
        filled
        solo
        max-width="280"
        class="input-style font-size-input text-light-input placeholder-light"
        :placeholder="searchPlaceholder"
      />
    </v-card-title>

    <v-data-table
      v-model:sort-by="sortBy"
      v-model:sort-desc="sortDesc"
      :headers="normalizedHeaders"
      :items="items"
      :search="search"
      :items-per-page="paginated ? itemsPerPage : -1"
      :hide-default-footer="!paginated"
      mobile-breakpoint="0"
      class="table"
    >
      <template #item.status="{ item }">
        <slot name="status" :item="item">
          <v-chip size="small" color="success" variant="tonal">{{ item.status || 'Active' }}</v-chip>
        </slot>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  name: 'LegacyTable',
  props: {
    title: { type: String, required: true },
    headers: { type: Array, required: true },
    items: { type: Array, required: true },
    searchable: { type: Boolean, default: true },
    paginated: { type: Boolean, default: false },
    itemsPerPage: { type: Number, default: 5 },
    defaultSortBy: { type: String, default: '' },
    defaultSortDesc: { type: Boolean, default: false },
    searchPlaceholder: { type: String, default: 'Search' },
  },
  data() {
    return {
      search: '',
      sortBy: this.defaultSortBy,
      sortDesc: this.defaultSortDesc,
    }
  },
  computed: {
    normalizedHeaders() {
      return this.headers.map((header) => ({ sortable: true, ...header }))
    },
  },
}
</script>

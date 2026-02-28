<template>
  <legacy-table
    title="Sortable Light"
    :headers="headers"
    :items="rows"
    default-sort-by="name"
    searchable
  />
</template>

<script>
import LegacyTable from '../../../../components/legacy-migration/composites/LegacyTable.vue'

export default {
  components: { LegacyTable },
  data() {
    return {
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'Status', value: 'status', align: 'end' },
      ],
      rows: [
        { name: 'Alice Martin', email: 'alice@example.com', status: 'Active' },
        { name: 'John Doe', email: 'john@example.com', status: 'Active' },
        { name: 'Jane Smith', email: 'jane@example.com', status: 'Active' },
      ],
    }
  },
}
</script>

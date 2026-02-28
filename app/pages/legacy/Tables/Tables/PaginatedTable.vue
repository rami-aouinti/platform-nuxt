<template>
  <legacy-table
    title="Paginated table"
    :headers="headers"
    :items="users"
    :items-per-page="6"
    paginated
    searchable
    default-sort-by="name"
  />
</template>

<script>
import LegacyTable from '../../../../components/legacy-migration/composites/LegacyTable.vue'
import users from './Users'

export default {
  name: 'PaginatedTable',
  components: { LegacyTable },
  data() {
    return {
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'Age', value: 'age' },
        { text: 'Salary', value: 'salary' },
      ],
      users,
    }
  },
}
</script>

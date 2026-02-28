<template>
  <legacy-table
    title="Sortable Dark"
    :headers="headers"
    :items="rows"
    default-sort-by="email"
    searchable
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import LegacyTable from '../../../../components/legacy-migration/composites/LegacyTable.vue';
const headers = ref([{
  text: 'Name',
  value: 'name'
}, {
  text: 'Email',
  value: 'email'
}, {
  text: 'Status',
  value: 'status',
  align: 'end'
}]);
const rows = ref([{
  name: 'Alice Martin',
  email: 'alice@example.com',
  status: 'Active'
}, {
  name: 'John Doe',
  email: 'john@example.com',
  status: 'Active'
}, {
  name: 'Jane Smith',
  email: 'jane@example.com',
  status: 'Active'
}]);
</script>

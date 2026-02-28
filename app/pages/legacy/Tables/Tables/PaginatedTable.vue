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

<script setup lang="ts">
import { ref } from "vue";
import LegacyTable from '../../../../components/legacy-migration/composites/LegacyTable.vue';
import usersData from './Users.ts';
const headers = ref([{
  text: 'Name',
  value: 'name'
}, {
  text: 'Email',
  value: 'email'
}, {
  text: 'Age',
  value: 'age'
}, {
  text: 'Salary',
  value: 'salary'
}]);
const users = ref(usersData);
</script>

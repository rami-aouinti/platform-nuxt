<template>
  <v-card class="card-shadow mb-6">
    <v-card-title class="text-h6">Sortable Translucent</v-card-title>
    <v-table density="comfortable">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th class="text-right">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in rows" :key="item.email">
          <td>{{ item.name }}</td>
          <td>{{ item.email }}</td>
          <td class="text-right">
            <v-chip size="small" color="success" variant="tonal">Active</v-chip>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
const rows = ref([{
  name: 'Alice Martin',
  email: 'alice@example.com'
}, {
  name: 'John Doe',
  email: 'john@example.com'
}, {
  name: 'Jane Smith',
  email: 'jane@example.com'
}]);
</script>

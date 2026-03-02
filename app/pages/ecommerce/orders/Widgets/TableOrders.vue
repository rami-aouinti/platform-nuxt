<template>
  <div class="pa-4">
    <v-table density="comfortable">
      <thead>
        <tr>
          <th class="text-left">Order</th>
          <th class="text-left">Customer</th>
          <th class="text-left">Status</th>
          <th class="text-left">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td>#{{ order.id }}</td>
          <td>{{ order.customer }}</td>
          <td>{{ order.status }}</td>
          <td>{{ order.total }}</td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script setup lang="ts">
const orders = [
  { id: 10251, customer: 'Olivia Martin', status: 'Paid', total: '$120.00' },
  { id: 10252, customer: 'Ava Brown', status: 'Refunded', total: '$79.00' },
  { id: 10253, customer: 'Noah Wilson', status: 'Canceled', total: '$34.50' }
]
</script>

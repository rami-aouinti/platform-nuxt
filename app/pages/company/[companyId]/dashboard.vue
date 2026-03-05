<script setup lang="ts">
definePageMeta({ middleware: ['auth'], requiresAuth: true })

const metricCards = [
  { title: 'Visitors', value: '5,927', trend: '+55%', color: 'success' },
  { title: 'Income', value: '$130,832', trend: '+90%', color: 'pink' },
  { title: 'New tab', value: 'Press the button above and complete the new tab data.', trend: '', color: 'dark' },
]

const transactions = [
  { title: 'Netflix', date: '27 March 2020, at 12:30 PM', value: '- $ 2,500', color: 'error' },
  { title: 'Apple', date: '23 March 2020, at 04:30 AM', value: '+ $ 2,000', color: 'success' },
  { title: 'Partner #22213', date: '19 March 2020, at 02:50 AM', value: '+ $ 1,400', color: 'success' },
]

const revenues = [
  { title: 'via PayPal', date: '07 June 2021, at 09:00 AM', value: '+ $ 4,999', color: 'success' },
  { title: 'Partner #90211', date: '07 June 2021, at 05:50 AM', value: '+ $ 700', color: 'success' },
  { title: 'Services', date: '07 June 2021, at 07:10 PM', value: '- $ 1,800', color: 'error' },
]

const categories = [
  { title: 'Devices', subtitle: '250 in stock, 346 sold' },
  { title: 'Tickets', subtitle: '123 closed, 15 open' },
  { title: 'Error logs', subtitle: '1 is active, 40 closed' },
]
</script>

<template>
  <CompanyWorkspaceLayout active-page="dashboard">
    <h1 class="text-h4 mb-4">Company dashboard</h1>

    <v-row>
      <v-col v-for="metric in metricCards" :key="metric.title" cols="12" md="4">
        <v-card rounded="lg" class="pa-4">
          <p class="text-body-2 text-medium-emphasis mb-1">{{ metric.title }}</p>
          <p class="text-h5 mb-0">{{ metric.value }}</p>
          <p v-if="metric.trend" :class="`text-${metric.color}`" class="text-caption mb-0">{{ metric.trend }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-1">
      <v-col cols="12" md="8">
        <v-card rounded="lg" class="pa-4 h-100">
          <p class="text-subtitle-1 font-weight-bold mb-2">Calendar</p>
          <v-sheet rounded="lg" border class="pa-6 text-center text-medium-emphasis">
            Monthly planning view (CRM style)
          </v-sheet>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="lg" class="pa-4 mb-4">
          <p class="text-subtitle-1 font-weight-bold mb-3">Categories</p>
          <v-list density="compact" class="pa-0">
            <v-list-item v-for="category in categories" :key="category.title" class="px-0">
              <v-list-item-title>{{ category.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ category.subtitle }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card rounded="lg" class="pa-4">
          <p class="text-subtitle-1 font-weight-bold mb-2">Message</p>
          <p class="text-body-2 text-medium-emphasis mb-3">Today is Mike's birthday. Wish her the best of luck!</p>
          <v-btn color="primary" variant="flat">Send Message</v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-1">
      <v-col cols="12" md="6">
        <v-card rounded="lg" class="pa-4">
          <div class="d-flex justify-space-between mb-2">
            <p class="text-subtitle-1 font-weight-bold mb-0">Transactions</p>
            <span class="text-caption text-medium-emphasis">23 - 30 March 2021</span>
          </div>

          <v-list density="comfortable" class="pa-0">
            <v-list-item v-for="item in transactions" :key="item.title" class="px-0">
              <template #prepend>
                <v-icon :color="item.color" class="me-3">mdi-circle-small</v-icon>
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.date }}</v-list-item-subtitle>
              <template #append>
                <span :class="`text-${item.color}`" class="text-body-2">{{ item.value }}</span>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="lg" class="pa-4">
          <div class="d-flex justify-space-between mb-2">
            <p class="text-subtitle-1 font-weight-bold mb-0">Revenue</p>
            <span class="text-caption text-medium-emphasis">01 - 07 June 2021</span>
          </div>

          <v-list density="comfortable" class="pa-0">
            <v-list-item v-for="item in revenues" :key="item.title" class="px-0">
              <template #prepend>
                <v-icon :color="item.color" class="me-3">mdi-circle-small</v-icon>
              </template>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.date }}</v-list-item-subtitle>
              <template #append>
                <span :class="`text-${item.color}`" class="text-body-2">{{ item.value }}</span>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </CompanyWorkspaceLayout>
</template>

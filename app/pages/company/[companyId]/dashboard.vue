<script setup lang="ts">
definePageMeta({ middleware: ['auth'], requiresAuth: true })

const metricCards = [
  { title: 'Visitors', value: '5,927', trend: '+55%', tone: 'success', icon: 'mdi-account-group' },
  { title: 'Income', value: '$130,832', trend: '+90%', tone: 'primary', icon: 'mdi-currency-usd' },
  {
    title: 'New tab',
    value: 'Press the button above and complete the new tab data.',
    trend: '',
    tone: 'warning',
    icon: 'mdi-file-document-plus',
  },
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

const statusIconByColor = {
  success: 'mdi-trending-up',
  error: 'mdi-trending-down',
} as const

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
        <v-card rounded="lg" class="pa-4 company-kpi-card">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center ga-3">
              <v-avatar :color="metric.tone" variant="tonal" size="32">
                <v-icon size="18">{{ metric.icon }}</v-icon>
              </v-avatar>
              <p class="text-overline text-medium-emphasis mb-0">{{ metric.title }}</p>
            </div>
            <v-chip
              v-if="metric.trend"
              :color="metric.tone"
              size="small"
              variant="tonal"
              class="text-caption font-weight-medium"
            >
              {{ metric.trend }}
            </v-chip>
          </div>
          <p class="text-h4 font-weight-bold mb-0">{{ metric.value }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-1">
      <v-col cols="12" md="8">
        <v-card rounded="lg" class="company-dashboard-card h-100">
          <p class="company-dashboard-card__title">Calendar</p>
          <v-sheet rounded="lg" border class="pa-6 text-center text-medium-emphasis">
            Monthly planning view (CRM style)
          </v-sheet>
        </v-card>
      </v-col>

      <v-col cols="12" md="4" class="d-flex flex-column ga-3 ga-md-4">
        <v-card rounded="lg" class="company-dashboard-card">
          <p class="company-dashboard-card__title">Categories</p>
          <v-list density="comfortable" class="pa-0 company-dashboard-list">
            <template v-for="(category, index) in categories" :key="category.title">
              <v-list-item class="px-0 company-dashboard-list-item">
                <v-list-item-title class="company-dashboard-list-item__title">{{ category.title }}</v-list-item-title>
                <v-list-item-subtitle class="company-dashboard-list-item__subtitle">{{ category.subtitle }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider v-if="index < categories.length - 1" class="company-dashboard-divider" />
            </template>
          </v-list>
        </v-card>

        <v-card rounded="lg" class="company-dashboard-card">
          <p class="company-dashboard-card__title">Message</p>
          <p class="text-body-2 text-medium-emphasis mb-3">Today is Mike's birthday. Wish her the best of luck!</p>
          <v-btn color="primary" variant="flat">Send Message</v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-1">
      <v-col cols="12" md="6">
        <v-card rounded="lg" class="company-dashboard-card">
          <div class="d-flex justify-space-between mb-2">
            <p class="company-dashboard-card__title mb-0">Transactions</p>
            <span class="company-dashboard-card__meta">23 - 30 March 2021</span>
          </div>

          <v-list density="comfortable" class="pa-0 company-dashboard-list">
            <template v-for="(item, index) in transactions" :key="item.title">
              <v-list-item class="px-0 company-dashboard-list-item">
                <template #prepend>
                  <v-avatar :color="item.color" size="24" variant="tonal" class="company-dashboard-list-item__prepend">
                    <v-icon size="14">{{ statusIconByColor[item.color as keyof typeof statusIconByColor] }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="company-dashboard-list-item__title">{{ item.title }}</v-list-item-title>
                <v-list-item-subtitle class="company-dashboard-list-item__subtitle">{{ item.date }}</v-list-item-subtitle>
                <template #append>
                  <span :class="`text-${item.color}`" class="text-body-2 font-weight-medium company-dashboard-list-item__append">{{ item.value }}</span>
                </template>
              </v-list-item>
              <v-divider v-if="index < transactions.length - 1" class="company-dashboard-divider" />
            </template>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="lg" class="company-dashboard-card">
          <div class="d-flex justify-space-between mb-2">
            <p class="company-dashboard-card__title mb-0">Revenue</p>
            <span class="company-dashboard-card__meta">01 - 07 June 2021</span>
          </div>

          <v-list density="comfortable" class="pa-0 company-dashboard-list">
            <template v-for="(item, index) in revenues" :key="item.title">
              <v-list-item class="px-0 company-dashboard-list-item">
                <template #prepend>
                  <v-avatar :color="item.color" size="24" variant="tonal" class="company-dashboard-list-item__prepend">
                    <v-icon size="14">{{ statusIconByColor[item.color as keyof typeof statusIconByColor] }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="company-dashboard-list-item__title">{{ item.title }}</v-list-item-title>
                <v-list-item-subtitle class="company-dashboard-list-item__subtitle">{{ item.date }}</v-list-item-subtitle>
                <template #append>
                  <span :class="`text-${item.color}`" class="text-body-2 font-weight-medium company-dashboard-list-item__append">{{ item.value }}</span>
                </template>
              </v-list-item>
              <v-divider v-if="index < revenues.length - 1" class="company-dashboard-divider" />
            </template>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </CompanyWorkspaceLayout>
</template>

<style scoped>
.company-kpi-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  box-shadow: 0 2px 8px rgba(var(--v-theme-on-surface), 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.company-kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(var(--v-theme-on-surface), 0.12);
}

.company-dashboard-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 12px;
  padding: 1rem;
}

.company-dashboard-card__title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.company-dashboard-card__meta {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.62);
}

.company-dashboard-list-item {
  min-height: 52px;
  padding-block: 0.35rem;
}

.company-dashboard-list-item__title {
  font-weight: 600;
}

.company-dashboard-list-item__subtitle {
  color: rgba(var(--v-theme-on-surface), 0.62);
}

.company-dashboard-list-item__prepend {
  margin-inline-end: 0.75rem;
}

.company-dashboard-list-item__append {
  margin-inline-start: 0.75rem;
}

.company-dashboard-divider {
  opacity: 0.55;
}
</style>

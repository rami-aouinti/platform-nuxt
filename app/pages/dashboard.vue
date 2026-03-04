<script setup lang="ts">
definePageMeta({
  icon: 'mdi-monitor-dashboard',
  title: 'Tableau de bord',
  drawerIndex: 1,
})
const stats = ref([
  {
    icon: 'mdi-web',
    title: 'Bande passante',
    value: 23,
    unit: 'GB',
    color: 'primary',
    caption: 'Montée : 13, Descente : 10',
  },
  {
    icon: 'mdi-rss',
    title: 'Soumissions',
    value: 108,
    color: 'primary',
    caption: 'Trop jeune, trop naïf',
  },
  {
    icon: 'mdi-send',
    title: 'Requêtes',
    value: 1238,
    color: 'warning',
    caption: 'Limite : 1320',
  },
  {
    icon: 'mdi-bell',
    title: 'Messages',
    value: 9042,
    color: 'primary',
    caption: 'Avertissements : 300, erreurs : 47',
  },
  {
    icon: 'mdi-github',
    title: 'Étoiles GitHub',
    value: NaN,
    color: 'grey',
    caption: "L'API ne répond pas",
  },
  {
    icon: 'mdi-currency-cny',
    title: 'Frais totaux',
    value: 2300,
    unit: '￥',
    color: 'error',
    caption: 'Limite haute : 2000 ￥',
  },
])
</script>

<template>
  <v-container fluid class="md-page md-surface-gradient">
    <v-row class="md-page-section">
      <v-col
        v-for="stat in stats"
        :key="stat.title"
        cols="12"
        sm="6"
        md="4"
        lg="2"
      >
        <StatsCard
          :title="stat.title"
          :unit="stat.unit"
          :color="stat.color"
          :icon="stat.icon"
          :value="stat.value"
        >
          <template #footer>
            {{ stat.caption }}
          </template>
        </StatsCard>
      </v-col>
    </v-row>
    <v-row class="md-page-section">
      <v-col cols="12" md="6" lg="12">
        <v-card class="pa-2 md-card-elevated dashboard-chart-card">
          <ChartLine />
        </v-card>
      </v-col>
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-2 md-card-elevated dashboard-chart-card">
          <ChartRadar />
        </v-card>
      </v-col>
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-2 md-card-elevated dashboard-chart-card">
          <ChartPie />
        </v-card>
      </v-col>
      <v-col cols="12" md="6" lg="4">
        <v-card class="pa-2 md-card-elevated dashboard-chart-card">
          <ChartBar />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.dashboard-chart-card {
  height: 340px;
}
</style>

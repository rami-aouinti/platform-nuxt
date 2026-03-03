<script setup lang="ts">
definePageMeta({
  icon: 'mdi-home',
  title: 'Home',
  drawerIndex: 0,
})

const quickLinks = [
  {
    title: 'À propos',
    description: 'Découvrez notre vision, nos valeurs et nos engagements.',
    icon: 'mdi-information-outline',
    to: '/about',
    color: 'primary',
  },
  {
    title: 'FAQ',
    description: 'Retrouvez les réponses aux questions les plus fréquentes.',
    icon: 'mdi-frequently-asked-questions',
    to: '/faq',
    color: 'info',
  },
  {
    title: 'Contact',
    description: 'Échangeons sur votre besoin et obtenez une démo personnalisée.',
    icon: 'mdi-card-account-mail-outline',
    to: '/contact',
    color: 'success',
  },
]

const getQuickLinkActionLabel = (title: string) => `Ouvrir ${title}`
const getQuickLinkAriaLabel = (title: string) => `Ouvrir la page ${title}`
</script>

<template>
  <v-container fluid class="home-page pa-6 pa-md-10">
    <v-row class="mb-8" align="center">
      <v-col cols="12" md="8" lg="7">
        <v-chip color="primary" variant="tonal" class="mb-4">Bienvenue</v-chip>
        <h1 class="text-h3 text-md-h2 font-weight-bold mb-4">Une UI moderne pour piloter votre activité</h1>
        <p class="text-body-1 text-medium-emphasis mb-6">
          Centralisez vos opérations RH, CRM et projets dans une expérience fluide et élégante.
          Explorez nos nouvelles pages pour mieux connaître la plateforme.
        </p>
        <div class="d-flex flex-wrap ga-3">
          <v-btn color="primary" size="large" to="/dashboard" prepend-icon="mdi-view-dashboard-outline">
            Ouvrir le dashboard
          </v-btn>
          <v-btn variant="outlined" size="large" to="/about" prepend-icon="mdi-information-outline">
            En savoir plus
          </v-btn>
        </div>
      </v-col>
      <v-col cols="12" md="4" lg="5">
        <v-card rounded="xl" elevation="10" class="pa-6 stat-card">
          <p class="text-overline text-primary mb-1">Performance opérationnelle</p>
          <p class="text-h3 font-weight-black mb-2">+42%</p>
          <p class="text-body-2 text-medium-emphasis mb-4">Gain moyen sur le traitement des workflows.</p>
          <div class="d-flex justify-space-between align-center mb-2">
            <span id="operational-performance-progress-label" class="text-caption text-medium-emphasis">
              Performance opérationnelle
            </span>
            <span id="operational-performance-progress-value" class="text-caption font-weight-bold">84 %</span>
          </div>
          <v-progress-linear
            model-value="84"
            color="primary"
            rounded
            height="10"
            aria-labelledby="operational-performance-progress-label operational-performance-progress-value"
          />
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="link in quickLinks" :key="link.title" cols="12" md="4">
        <v-card rounded="xl" class="h-100 pa-5 quick-link-card" elevation="4">
          <v-avatar :color="`${link.color}-lighten-5`" size="48" class="mb-4">
            <v-icon :icon="link.icon" :color="link.color" />
          </v-avatar>
          <h2 class="text-h6 font-weight-bold mb-2">{{ link.title }}</h2>
          <p class="text-body-2 text-medium-emphasis mb-4">{{ link.description }}</p>
          <v-btn
            :color="link.color"
            variant="text"
            :to="link.to"
            append-icon="mdi-arrow-right"
            :aria-label="getQuickLinkAriaLabel(link.title)"
          >
            {{ getQuickLinkActionLabel(link.title) }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.home-page {
  min-height: calc(100vh - 64px);
}

.stat-card {
  background: linear-gradient(160deg, rgb(var(--v-theme-surface)), rgb(var(--v-theme-primary), 0.06));
}

.quick-link-card {
  transition: transform 0.2s ease;
}

.quick-link-card:hover {
  transform: translateY(-4px);
}
</style>

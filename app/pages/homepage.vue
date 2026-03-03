<script setup lang="ts">
definePageMeta({
  icon: 'mdi-home',
  title: 'Home',
  drawerIndex: 0,
  layout: 'landing',
  appBarFloating: false
})

const LazyHomeSecondaryLinks = defineAsyncComponent(
  () => import('~/components/home/HomeSecondaryLinks.vue'),
)

const showSecondaryContent = ref(false)

const renderSecondaryContent = () => {
  showSecondaryContent.value = true
}

onMounted(() => {
  const revealOnInteraction = () => {
    renderSecondaryContent()
    window.removeEventListener('pointerdown', revealOnInteraction)
    window.removeEventListener('keydown', revealOnInteraction)
    window.removeEventListener('scroll', revealOnInteraction)
  }

  window.addEventListener('pointerdown', revealOnInteraction, { passive: true, once: true })
  window.addEventListener('keydown', revealOnInteraction, { once: true })
  window.addEventListener('scroll', revealOnInteraction, { passive: true, once: true })
})
</script>

<template>
  <v-container fluid class="home-page pa-6 pa-md-10">
    <v-row class="mb-8" align="center">
      <v-col cols="12" md="8" lg="7" class="hero-content">
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
          <v-btn
            variant="text"
            size="large"
            color="secondary"
            append-icon="mdi-arrow-down"
            @click="renderSecondaryContent"
          >
            Explorer plus
          </v-btn>
        </div>
      </v-col>
      <v-col cols="12" md="4" lg="5" class="hero-stat-col">
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

    <component
      :is="LazyHomeSecondaryLinks"
      v-if="showSecondaryContent"
    />
  </v-container>
</template>

<style scoped>
.home-page {
  min-height: calc(100vh - 72px);
}

.hero-content {
  min-height: 360px;
}

.hero-stat-col {
  min-height: 280px;
}

.stat-card {
  min-height: 280px;
  background: linear-gradient(160deg, rgb(var(--v-theme-surface)), rgb(var(--v-theme-primary), 0.06));
}

@media (min-width: 960px) {
  .hero-content {
    min-height: 420px;
  }

  .hero-stat-col,
  .stat-card {
    min-height: 320px;
  }
}

.quick-link-card {
  transition: transform 0.2s ease;
}

.quick-link-card:hover {
  transform: translateY(-4px);
}
</style>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'], requiresAuth: true })

const metricCards = [
  { title: 'Projets actifs', value: '18', trend: '+3 ce mois', tone: 'success', icon: 'mdi-briefcase-outline' },
  { title: 'Tickets ouverts', value: '27', trend: '-12%', tone: 'primary', icon: 'mdi-ticket-outline' },
  {
    title: 'MR en attente',
    value: '9',
    trend: '2 urgentes',
    tone: 'warning',
    icon: 'mdi-source-pull',
  },
]

const transactions = [
  { title: 'Sprint Frontend - v2.4 validé', date: 'Lundi 8 juillet, 09:20', value: '+ 4 tâches', color: 'success' },
  { title: 'Incident API paiement ouvert', date: 'Mardi 9 juillet, 11:45', value: '- 1 incident', color: 'error' },
  { title: 'Revue design terminée', date: 'Mercredi 10 juillet, 16:10', value: '+ 2 livrables', color: 'success' },
]

const revenues = [
  { title: 'Export client ACME envoyé', date: 'Jeudi 11 juillet, 08:55', value: '+ 1 livraison', color: 'success' },
  { title: 'Backlog produit priorisé', date: 'Jeudi 11 juillet, 14:05', value: '+ 6 éléments', color: 'success' },
  { title: 'Hotfix authentification appliqué', date: 'Vendredi 12 juillet, 18:20', value: '- 1 blocage', color: 'error' },
]

const statusIconByColor = {
  success: 'mdi-trending-up',
  error: 'mdi-trending-down',
} as const

const categories = [
  { title: 'Projets', subtitle: '18 actifs, 5 en cadrage' },
  { title: 'Support', subtitle: '42 résolus, 27 en cours' },
  { title: 'Déploiements', subtitle: '3 cette semaine, 1 en attente QA' },
]
</script>

<template>
  <CompanyWorkspaceLayout active-page="dashboard">
    <h1 class="text-h4 mb-4">Tableau de bord entreprise</h1>

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
          <p class="company-dashboard-card__title">Planning de l'équipe</p>
          <v-sheet rounded="lg" border class="pa-6 text-center text-medium-emphasis">
            Vue mensuelle des jalons, revues et échéances de livraison
          </v-sheet>
        </v-card>
      </v-col>

      <v-col cols="12" md="4" class="d-flex flex-column ga-3 ga-md-4">
        <v-card rounded="lg" class="company-dashboard-card">
          <p class="company-dashboard-card__title">Suivi global</p>
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
          <p class="company-dashboard-card__title">Actions rapides</p>
          <p class="text-body-2 text-medium-emphasis mb-3">Accédez directement aux tâches fréquentes de votre équipe.</p>
          <div class="d-flex flex-wrap ga-2">
            <v-btn color="primary" variant="tonal">Créer projet</v-btn>
            <v-btn color="primary" variant="tonal">Inviter membre</v-btn>
            <v-btn color="primary" variant="tonal">Ouvrir backlog</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-1">
      <v-col cols="12" md="6">
        <v-card rounded="lg" class="company-dashboard-card">
          <div class="d-flex justify-space-between mb-2">
            <p class="company-dashboard-card__title mb-0">Activité équipe</p>
            <span class="company-dashboard-card__meta">Du 8 au 12 juillet 2024</span>
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
            <p class="company-dashboard-card__title mb-0">Livraisons de la semaine</p>
            <span class="company-dashboard-card__meta">Dernières actions</span>
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

<script setup lang="ts">
definePageMeta({
  icon: 'mdi-information-outline',
  title: 'À propos',
  drawerIndex: 1,
})

const values = [
  {
    icon: 'mdi-lightbulb-on-outline',
    title: 'Innovation continue',
    description:
      'Nous concevons des expériences digitales modernes pour simplifier le travail de vos équipes.',
  },
  {
    icon: 'mdi-account-group-outline',
    title: 'Approche humaine',
    description:
      'Chaque fonctionnalité est pensée pour améliorer la collaboration entre managers, RH et candidats.',
  },
  {
    icon: 'mdi-shield-check-outline',
    title: 'Confiance & sécurité',
    description:
      'La protection des données et la fiabilité de la plateforme sont au cœur de notre roadmap.',
  },
]
</script>

<template>
  <v-container fluid class="pa-6 pa-md-10">
    <v-row class="mb-6" align="center">
      <v-col cols="12" md="7">
        <v-chip color="primary" variant="tonal" class="mb-4">Notre mission</v-chip>
        <h1 class="text-h3 text-md-h2 font-weight-bold mb-4">À propos de BroWorld</h1>
        <p class="text-body-1 text-medium-emphasis mb-6">
          BroWorld est une plateforme tout-en-un dédiée à la gestion des talents,
          du recrutement et des opérations CRM. Nous combinons performance,
          simplicité et design pour offrir une expérience intuitive au quotidien.
        </p>
        <div class="d-flex ga-3 flex-wrap">
          <v-btn color="primary" prepend-icon="mdi-rocket-launch" to="/dashboard">
            Découvrir la plateforme
          </v-btn>
          <v-btn variant="outlined" prepend-icon="mdi-email-outline" to="/contact">
            Nous contacter
          </v-btn>
        </div>
      </v-col>
      <v-col cols="12" md="5">
        <v-card rounded="xl" elevation="8" class="pa-6 bg-primary text-white">
          <h2 class="text-h5 font-weight-bold mb-4">En quelques chiffres</h2>
          <v-row>
            <v-col cols="6">
              <p class="text-h4 font-weight-black mb-1">10k+</p>
              <p class="text-body-2 mb-0">Profils suivis</p>
            </v-col>
            <v-col cols="6">
              <p class="text-h4 font-weight-black mb-1">98%</p>
              <p class="text-body-2 mb-0">Satisfaction client</p>
            </v-col>
            <v-col cols="6">
              <p class="text-h4 font-weight-black mb-1">24/7</p>
              <p class="text-body-2 mb-0">Support disponible</p>
            </v-col>
            <v-col cols="6">
              <p class="text-h4 font-weight-black mb-1">+35</p>
              <p class="text-body-2 mb-0">Fonctionnalités métier</p>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="value in values" :key="value.title" cols="12" md="4">
        <v-card rounded="xl" class="h-100 pa-5" variant="tonal" color="surface-light">
          <v-icon :icon="value.icon" color="primary" size="36" class="mb-4" />
          <h3 class="text-h6 font-weight-bold mb-2">{{ value.title }}</h3>
          <p class="text-body-2 text-medium-emphasis mb-0">{{ value.description }}</p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

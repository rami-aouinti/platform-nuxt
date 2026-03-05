<script setup lang="ts">
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
  <v-row>
    <v-col
      v-for="link in quickLinks"
      :key="link.title"
      cols="12"
      md="4"
    >
      <v-card rounded="lg" class="h-100 pa-5 quick-link-card" elevation="4">
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
</template>

<style scoped>
.quick-link-card {
  transition: transform 0.2s ease;
}

.quick-link-card:hover {
  transform: translateY(-4px);
}
</style>

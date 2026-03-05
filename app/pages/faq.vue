<script setup lang="ts">
definePageMeta({
  icon: 'mdi-frequently-asked-questions',
  title: 'FAQ',
  drawerIndex: 2,
})

const faqItems = [
  {
    question: 'Comment créer un nouveau profil candidat ?',
    answer:
      'Rendez-vous dans le module Recrutement, puis cliquez sur “Ajouter un candidat”. Vous pouvez importer un CV ou compléter le formulaire manuellement.',
  },
  {
    question: 'Peut-on connecter BroWorld à d’autres outils ?',
    answer:
      'Oui, la plateforme propose des intégrations API et des connecteurs pour synchroniser vos données avec vos services RH ou CRM existants.',
  },
  {
    question: 'Comment suivre l’avancement des tâches ?',
    answer:
      'Le module tâches inclut des vues Kanban et tableau. Vous pouvez filtrer par statut, priorité, équipe ou projet.',
  },
  {
    question: 'Quelle est la politique de sécurité des données ?',
    answer:
      'Nous appliquons des bonnes pratiques de chiffrement, de contrôle d’accès et de journalisation afin de garantir un haut niveau de sécurité.',
  },
]
</script>

<template>
  <v-container fluid class="pa-6 pa-md-10">
    <v-row justify="center" class="mb-6">
      <v-col cols="12" md="10" lg="8">
        <v-card rounded="xl" class="pa-6 pa-md-8 workspace-sidebar-card" elevation="6">
          <v-chip color="primary" variant="tonal" class="mb-4">Centre d'aide</v-chip>
          <h1 class="text-h3 font-weight-bold mb-3">Questions fréquentes</h1>
          <p class="text-body-1 text-medium-emphasis mb-0">
            Trouvez rapidement des réponses aux questions les plus posées par nos utilisateurs.
          </p>
        </v-card>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-expansion-panels variant="accordion" rounded="xl">
          <v-expansion-panel
            v-for="item in faqItems"
            :key="item.question"
            :title="item.question"
            :text="item.answer"
          />
        </v-expansion-panels>
      </v-col>
    </v-row>

    <v-row justify="center" class="mt-6">
      <v-col cols="12" md="10" lg="8">
        <v-alert
          type="info"
          variant="tonal"
          icon="mdi-lifebuoy"
          title="Besoin d’une réponse personnalisée ?"
          text="Notre équipe support est disponible pour vous accompagner."
        >
          <template #append>
            <v-btn color="primary" to="/contact" variant="text">Contacter le support</v-btn>
          </template>
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

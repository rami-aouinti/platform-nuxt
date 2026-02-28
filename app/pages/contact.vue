<script setup lang="ts">
definePageMeta({
  icon: 'mdi-card-account-mail-outline',
  title: 'Contact',
  drawerIndex: 3,
})

const supportChannels = [
  {
    icon: 'mdi-email-fast-outline',
    title: 'Email',
    value: 'support@broworld.io',
    detail: 'Réponse sous 24h ouvrées.',
  },
  {
    icon: 'mdi-phone-outline',
    title: 'Téléphone',
    value: '+33 1 23 45 67 89',
    detail: 'Du lundi au vendredi, 9h-18h.',
  },
  {
    icon: 'mdi-map-marker-outline',
    title: 'Adresse',
    value: '12 Rue de la Productivité, Paris',
    detail: 'Accueil sur rendez-vous.',
  },
]
</script>

<template>
  <v-container fluid class="pa-6 pa-md-10">
    <v-row>
      <v-col cols="12" lg="7">
        <v-card rounded="xl" class="pa-6 pa-md-8 mb-6" elevation="6">
          <v-chip color="primary" variant="tonal" class="mb-4">Parlons de votre projet</v-chip>
          <h1 class="text-h3 font-weight-bold mb-3">Contactez-nous</h1>
          <p class="text-body-1 text-medium-emphasis mb-6">
            Une question, un besoin de démo ou un accompagnement sur mesure ?
            Notre équipe est à votre écoute.
          </p>

          <v-form>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field label="Prénom" variant="outlined" prepend-inner-icon="mdi-account-outline" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field label="Nom" variant="outlined" prepend-inner-icon="mdi-account-outline" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field label="Email" variant="outlined" type="email" prepend-inner-icon="mdi-email-outline" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field label="Entreprise" variant="outlined" prepend-inner-icon="mdi-domain" />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  label="Votre message"
                  variant="outlined"
                  rows="5"
                  prepend-inner-icon="mdi-message-text-outline"
                />
              </v-col>
            </v-row>
            <div class="d-flex justify-end">
              <v-btn color="primary" size="large" prepend-icon="mdi-send">Envoyer</v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card rounded="xl" class="pa-6 pa-md-8 h-100" color="grey-lighten-5">
          <h2 class="text-h5 font-weight-bold mb-4">Nos canaux de support</h2>
          <v-list lines="two" bg-color="transparent" class="pa-0">
            <v-list-item v-for="channel in supportChannels" :key="channel.title" class="px-0">
              <template #prepend>
                <v-avatar color="primary" variant="tonal" class="mr-4">
                  <v-icon :icon="channel.icon" color="primary" />
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold">{{ channel.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ channel.value }}</v-list-item-subtitle>
              <v-list-item-subtitle>{{ channel.detail }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-divider class="my-4" />

          <v-alert
            type="success"
            variant="tonal"
            icon="mdi-check-decagram-outline"
            title="Accompagnement premium"
            text="Bénéficiez d'un onboarding dédié pour déployer BroWorld rapidement."
          />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

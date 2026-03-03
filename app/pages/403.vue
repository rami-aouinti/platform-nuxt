<script setup lang="ts">
import {
  getPermissionDeniedMessage,
  type AdminPermission,
} from '~/utils/permissions/admin'

definePageMeta({
  title: 'Forbidden',
})

const route = useRoute()

const reason = computed(() => {
  const value = route.query.reason
  return Array.isArray(value) ? value[0] : value
})

const permission = computed<AdminPermission>(() => {
  const value = route.query.permission
  const current = Array.isArray(value) ? value[0] : value

  if (
    current === 'admin' ||
    current === 'manageUsers' ||
    current === 'manageApiKeys'
  ) {
    return current
  }

  return 'admin'
})

const title = computed(() =>
  reason.value === 'error' ? 'Erreur de chargement des rôles' : 'Accès refusé',
)

const message = computed(() => {
  if (reason.value === 'error') {
    return 'Impossible de vérifier vos autorisations pour le moment. Veuillez réessayer.'
  }

  return getPermissionDeniedMessage(permission.value)
})
</script>

<template>
  <v-container class="py-12">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card rounded="xl" elevation="6" class="pa-6">
          <v-alert type="error" variant="tonal" density="comfortable" class="mb-4">
            {{ title }}
          </v-alert>
          <p class="mb-6">{{ message }}</p>
          <v-btn color="primary" to="/">Retour à l'accueil</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

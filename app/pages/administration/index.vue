<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  icon: 'mdi-shield-crown-outline',
  title: 'Administration',
  drawerIndex: 7,
  requiresAuth: true,
  requiresAdmin: true,
  middleware: ['auth', 'admin-access'],
})

const authStore = useAuthStore()
const { rolesLoading, rolesError, hasAdminAccess } = storeToRefs(authStore)

const adminLinks = [
  { title: 'Users', to: '/administration/users', icon: 'mdi-account-multiple-outline' },
  { title: 'UserGroups', to: '/administration/user-groups', icon: 'mdi-account-group-outline' },
  { title: 'Roles', to: '/administration/roles', icon: 'mdi-shield-account-outline' },
  { title: 'ApiKeys', to: '/administration/api-keys', icon: 'mdi-key-variant' },
  { title: 'Companies', to: '/administration/companies', icon: 'mdi-domain' },
  { title: 'Candidates', to: '/administration/candidates', icon: 'mdi-account-search' },
  { title: 'Notifications', to: '/administration/notifications', icon: 'mdi-bell-outline' },
]

onMounted(async () => {
  try {
    await authStore.ensureRolesLoaded()
  } catch {
    // Le middleware gère déjà la redirection erreur/403.
  }
})
</script>

<template>
  <v-container fluid class="pa-6">
    <v-card rounded="xl" elevation="6" class="pa-6">
      <h1 class="text-h4 font-weight-bold mb-4">Administration</h1>

      <div v-if="rolesLoading" class="d-flex align-center ga-3">
        <v-progress-circular indeterminate color="primary" />
        <span>Chargement des rôles utilisateur...</span>
      </div>

      <v-alert
        v-else-if="rolesError"
        type="error"
        variant="tonal"
        density="comfortable"
        class="mb-0"
      >
        {{ rolesError }}
      </v-alert>

      <v-alert
        v-else-if="!hasAdminAccess"
        type="warning"
        variant="tonal"
        density="comfortable"
        class="mb-0"
      >
        Vous n'êtes pas autorisé à accéder à l'administration.
      </v-alert>

      <v-row v-else class="mt-2">
        <v-col v-for="item in adminLinks" :key="item.to" cols="12" sm="6" lg="3">
          <v-card variant="tonal" rounded="lg" class="h-100">
            <v-card-item>
              <template #prepend>
                <v-icon :icon="item.icon" color="primary" class="mr-2" />
              </template>
              <v-card-title>{{ item.title }}</v-card-title>
            </v-card-item>
            <v-card-actions>
              <v-btn color="primary" variant="text" :to="item.to">Ouvrir</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

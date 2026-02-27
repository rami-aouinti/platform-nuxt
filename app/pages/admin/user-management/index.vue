<script setup lang="ts">
import { storeToRefs } from 'pinia'
import AdminBadge from '~/components/admin/ui/AdminBadge.vue'
import AdminCard from '~/components/admin/ui/AdminCard.vue'
import AdminToolbar from '~/components/admin/ui/AdminToolbar.vue'
import { useAuthStore } from '~/stores/auth'
import {
  hasAdminPermission,
  type AdminPermission,
} from '~/utils/permissions/admin'

type UserManagementLink = {
  title: string
  to: string
  icon: string
  description: string
  permission: AdminPermission
}

definePageMeta({
  icon: 'mdi-account-multiple-outline',
  title: 'User Management',
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
})

const authStore = useAuthStore()
const { roles } = storeToRefs(authStore)

const links: UserManagementLink[] = [
  {
    title: 'Users',
    to: '/admin/user-management/users',
    icon: 'mdi-account-outline',
    description: 'Gérer les utilisateurs de la plateforme.',
    permission: 'manageUsers',
  },
  {
    title: 'Roles',
    to: '/admin/user-management/roles',
    icon: 'mdi-shield-account-outline',
    description: 'Configurer les rôles et permissions.',
    permission: 'admin',
  },
  {
    title: 'Groups',
    to: '/admin/user-management/user-groups',
    icon: 'mdi-account-group-outline',
    description: 'Organiser les utilisateurs en groupes.',
    permission: 'manageUsers',
  },
  {
    title: 'Api Keys',
    to: '/admin/user-management/api-keys',
    icon: 'mdi-key-variant',
    description: 'Administrer les clés API.',
    permission: 'manageApiKeys',
  },
]

const scopedLinks = computed(() =>
  links.map((entry) => ({
    ...entry,
    disabled: !hasAdminPermission(roles.value, entry.permission),
  })),
)

const hasAnyLink = computed(() => scopedLinks.value.some((entry) => !entry.disabled))

onMounted(async () => {
  await authStore.ensureRolesLoaded()
})
</script>

<template>
  <AdminCard>
    <AdminToolbar
      title="User Management"
      description="Accédez aux ressources utilisateurs, rôles, groupes et clés API."
    >
      <template #actions>
        <AdminBadge status="info" label="Section" />
      </template>
    </AdminToolbar>

    <v-btn
      class="mb-4"
      variant="text"
      prepend-icon="mdi-arrow-left"
      to="/administration"
    >
      Retour à l'administration
    </v-btn>

    <v-row dense>
      <v-col
        v-for="entry in scopedLinks"
        :key="entry.to"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card rounded="lg" variant="outlined" class="h-100 d-flex flex-column">
          <v-card-title class="d-flex align-center ga-2">
            <v-icon :icon="entry.icon" />
            <span>{{ entry.title }}</span>
          </v-card-title>

          <v-card-text class="text-medium-emphasis">{{ entry.description }}</v-card-text>

          <v-spacer />

          <v-card-actions>
            <v-btn
              block
              color="primary"
              variant="tonal"
              :to="entry.disabled ? undefined : entry.to"
              :disabled="entry.disabled"
            >
              Ouvrir
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-alert
      v-if="!hasAnyLink"
      class="mt-4"
      type="warning"
      variant="tonal"
      title="Aucun accès disponible"
      text="Votre rôle ne permet pas d'ouvrir une ressource de gestion des utilisateurs."
    />
  </AdminCard>
</template>

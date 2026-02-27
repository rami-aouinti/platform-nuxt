<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import {
  hasAdminPermission,
  type AdminPermission,
} from '~/utils/permissions/admin'

const authStore = useAuthStore()
const route = useRoute()
const { roles } = storeToRefs(authStore)

const links = [
  { title: 'Users', to: '/administration/users', icon: 'mdi-account-multiple-outline', permission: 'manageUsers' as AdminPermission },
  { title: 'User Groups', to: '/administration/user-groups', icon: 'mdi-account-group-outline', permission: 'manageUsers' as AdminPermission },
  { title: 'Roles', to: '/administration/roles', icon: 'mdi-shield-account-outline', permission: 'admin' as AdminPermission },
  { title: 'Api Keys', to: '/administration/api-keys', icon: 'mdi-key-variant', permission: 'manageApiKeys' as AdminPermission },
  { title: 'Companies', to: '/administration/companies', icon: 'mdi-domain', permission: 'admin' as AdminPermission },
  { title: 'Candidates', to: '/administration/candidates', icon: 'mdi-account-search', permission: 'admin' as AdminPermission },
  { title: 'Notifications', to: '/administration/notifications', icon: 'mdi-bell-outline', permission: 'admin' as AdminPermission },
]

const scopedLinks = computed(() =>
  links.map((entry) => ({
    ...entry,
    disabled: !hasAdminPermission(roles.value, entry.permission),
  })),
)

onMounted(async () => {
  await authStore.ensureRolesLoaded()
})
</script>

<template>
  <div class="administration-layout">
    <AppDrawer />
    <AppBar />
    <v-main class="administration-layout-main">
      <v-container fluid class="pa-4 admin-layout">
        <v-row>
          <v-col cols="12" md="3" lg="2">
            <v-card rounded="xl" variant="outlined" class="pa-2 admin-layout-sidebar">
              <v-list nav density="comfortable">
                <v-list-subheader>Administration</v-list-subheader>
                <v-list-item
                  v-for="entry in scopedLinks"
                  :key="entry.to"
                  :title="entry.title"
                  :prepend-icon="entry.icon"
                  :to="entry.disabled ? undefined : entry.to"
                  :active="route.path.startsWith(entry.to)"
                  :disabled="entry.disabled"
                  rounded="lg"
                />
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12" md="9" lg="10" class="admin-layout-content">
            <slot />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </div>
</template>

<style scoped>
.administration-layout-main {
  padding-top: 0;
  margin-top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.admin-layout {
  min-height: 100%;
}

.admin-layout-sidebar {
  position: sticky;
  top: 20px;
}

.admin-layout-content {
  min-height: 100%;
}
</style>

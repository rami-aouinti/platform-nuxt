<script setup lang="ts">
definePageMeta({
  icon: 'mdi-shield-crown-outline',
  title: 'Administration',
  drawerIndex: 7,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
})
</script>

<template>
  <AdminCard>
    <AdminToolbar
      title="Administration"
      description="Prototype de navigation admin avec pages ressources prêtes à connecter aux APIs métier."
    >
      <template #actions>
        <AdminBadge status="info" label="Prototype" />
      </template>
    </AdminToolbar>

    <AdminEmptyState
      icon="mdi-view-dashboard-outline"
      title="Sélectionnez une ressource"
      message="Utilisez la sidebar pour ouvrir Users, User Groups, Roles, Api Keys, Companies, Candidates ou Notifications."
    />
  </AdminCard>
</template>

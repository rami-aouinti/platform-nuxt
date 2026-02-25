<script setup lang="ts">
definePageMeta({
  icon: 'mdi-briefcase-search-outline',
  title: 'Offres disponibles',
  drawerIndex: 20,
  requiresAuth: true,
  middleware: ['auth'],
})

await navigateTo('/offers')
</script>

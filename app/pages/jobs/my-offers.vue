<script setup lang="ts">
definePageMeta({
  icon: 'mdi-briefcase-edit-outline',
  title: 'Mes offres',
  drawerIndex: 21,
  requiresAuth: true,
  middleware: ['auth'],
})

await navigateTo('/offers/my-offers')
</script>

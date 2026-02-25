<script setup lang="ts">
definePageMeta({
  icon: 'mdi-account-check-outline',
  title: 'Mes candidatures',
  drawerIndex: 23,
  requiresAuth: true,
  middleware: ['auth'],
})

await navigateTo('/offers/my-applications')
</script>

<script setup lang="ts">
definePageMeta({
  requiresAuth: true,
  requiresAdmin: true,
  middleware: ['auth', 'admin-access'],
})

await navigateTo('/admin', { redirectCode: 301 })
</script>

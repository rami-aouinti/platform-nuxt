<script setup lang="ts">
await navigateTo({
  path: '/profile',
  query: { tab: 'two-factor-auth' },
  hash: '#tab-two-factor-auth',
}, { replace: true })
</script>

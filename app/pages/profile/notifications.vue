<script setup lang="ts">
await navigateTo({
  path: '/profile',
  query: { tab: 'notifications' },
  hash: '#tab-notifications',
}, { replace: true })
</script>

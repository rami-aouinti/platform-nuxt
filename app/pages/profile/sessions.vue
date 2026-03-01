<script setup lang="ts">
await navigateTo({
  path: '/profile',
  query: { tab: 'sessions' },
  hash: '#tab-sessions',
}, { replace: true })
</script>

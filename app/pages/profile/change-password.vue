<script setup lang="ts">
await navigateTo({
  path: '/profile',
  query: { tab: 'change-password' },
  hash: '#tab-change-password',
}, { replace: true })
</script>

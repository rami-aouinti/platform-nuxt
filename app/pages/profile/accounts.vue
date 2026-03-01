<script setup lang="ts">
await navigateTo({
  path: '/profile',
  query: { tab: 'accounts' },
  hash: '#tab-accounts',
}, { replace: true })
</script>

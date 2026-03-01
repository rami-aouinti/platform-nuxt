<script setup lang="ts">
await navigateTo({
  path: '/profile',
  query: { tab: 'delete-account' },
  hash: '#tab-delete-account',
}, { replace: true })
</script>

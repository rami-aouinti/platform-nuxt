<script setup lang="ts">
await navigateTo({
  path: '/profile',
  query: { tab: 'basic-info' },
  hash: '#tab-basic-info',
}, { replace: true })
</script>

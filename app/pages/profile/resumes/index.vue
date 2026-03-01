<script setup lang="ts">
await navigateTo(
  {
    path: '/profile',
    query: { tab: 'resumes' },
    hash: '#tab-resumes',
  },
  { replace: true },
)
</script>

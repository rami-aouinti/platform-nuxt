<template>
  <v-container fluid class="index-blank-page" />
</template>
<script setup lang="ts">
definePageMeta({
  icon: 'mdi-home',
  title: 'Home',
  drawerIndex: 0,
  appBarFloating: false,
  appBarShowSecondaryActions: true,
})
</script>

<style scoped>
.index-blank-page {
  min-height: calc(100vh - 72px);
}
</style>

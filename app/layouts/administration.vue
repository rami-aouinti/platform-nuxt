<template>
  <div class="administration-layout">
    <AppBar />
    <v-main class="administration-layout-main">
      <v-container fluid class="pa-4">
        <slot />
      </v-container>
    </v-main>
  </div>
</template>

<style scoped>
.administration-layout-main {
  padding-top: 0;
  margin-top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}
</style>

<template>
  <div class="administration-layout">
    <AppDrawer />
    <AppBar />
    <v-main
      class="administration-layout-main md-main-offset-margin md-main-offset-height"
    >
      <v-container fluid class="pa-4">
        <slot />
      </v-container>
    </v-main>
  </div>
</template>

<style scoped>
.administration-layout-main {
  padding-top: 0;
  overflow-y: auto;
}
</style>

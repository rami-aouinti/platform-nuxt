<template>
  <div class="default-layout">
    <AppBar :show-drawer-toggle="false" show-brand-link />
    <v-main class="default-layout-main">
      <slot />
    </v-main>
    <AppFooter />
  </div>
</template>

<style scoped>
.default-layout-main {
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 64px;
  margin-bottom: 32px;
  height: calc(100vh - 64px - 32px);
  overflow-y: auto;
  transition-property: padding;
}
</style>

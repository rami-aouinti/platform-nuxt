<template>
  <v-main class="auth-layout-main">
    <slot />
  </v-main>
</template>

<style scoped>
.auth-layout-main {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

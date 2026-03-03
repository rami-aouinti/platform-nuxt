<template>
  <div class="landing-layout">
    <v-app-bar
      flat
      class="landing-layout__bar px-4 px-md-8"
      height="72"
    >
      <NuxtLink
        to="/homepage"
        class="landing-layout__brand text-decoration-none"
      >
        Bro World
      </NuxtLink>

      <v-spacer />

      <nav class="d-flex align-center ga-2 ga-md-3">
        <v-btn variant="text" to="/about">À propos</v-btn>
        <v-btn variant="text" to="/faq">FAQ</v-btn>
        <v-btn color="primary" to="/login">Connexion</v-btn>
      </nav>
    </v-app-bar>

    <v-main class="landing-layout__main">
      <slot />
    </v-main>
  </div>
</template>

<style scoped>
.landing-layout__bar {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  backdrop-filter: blur(8px);
  background: rgba(var(--v-theme-surface), 0.9);
}

.landing-layout__brand {
  color: rgb(var(--v-theme-on-surface));
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.landing-layout__main {
  padding-top: 0;
}
</style>

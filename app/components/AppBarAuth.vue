<template>
  <v-app-bar color="transparent" flat>
    <NuxtLink to="/" class="text-decoration-none text-white font-weight-bold text-h6">
      BroWorld
    </NuxtLink>
    <v-spacer />
    <v-btn variant="text" color="white" to="/login">Sign in</v-btn>
    <v-btn variant="outlined" color="white" to="/register">Sign up</v-btn>
  </v-app-bar>
</template>

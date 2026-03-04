<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  icon: 'mdi-lock-check-outline',
  title: 'Login',
  middleware: 'guest',
  layout: 'auth',
})

const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

const loading = ref(false)
const errorMessage = ref('')

const form = reactive({
  username: '',
  password: '',
})

const hasCredentials = computed(() => {
  return Boolean(form.username.trim()) && Boolean(form.password)
})

async function login() {
  if (!hasCredentials.value || loading.value) {
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await authStore.login(form.username, form.password)
    form.password = ''
    await navigateTo('/')
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    errorMessage.value = message
      ? `Connexion échouée : ${message}`
      : 'Connexion échouée : identifiants invalides ou API inaccessible.'
  } finally {
    loading.value = false
  }
}

function logout() {
  authStore.logout()
  form.password = ''
}
</script>

<template>
  <v-container
    fluid
    class="md-page md-theme-page-bg d-flex align-center justify-center"
  >
    <UiCard
      class="login-card md-card-elevated"
      elevation="0"
      rounded="xl"
      shadow="xl"
    >
      <v-card-text class="pa-8 pa-md-10">
        <div class="text-center mb-8">
          <UiAvatar size="xl" class="mx-auto mb-4 md-theme-brand-gradient">
            <v-icon icon="mdi-lock-check-outline" size="34" color="white" />
          </UiAvatar>
          <h1 class="text-h4 font-weight-bold mb-2">Connexion sécurisée</h1>
          <p class="text-medium-emphasis">
            Authentifiez-vous pour accéder à votre espace.
          </p>
        </div>

        <v-form @submit.prevent="login">
          <v-text-field
            v-model="form.username"
            label="Username"
            prepend-inner-icon="mdi-account-outline"
            variant="outlined"
            density="comfortable"
            autocomplete="username"
            required
            class="mb-4"
          />

          <v-text-field
            v-model="form.password"
            label="Password"
            prepend-inner-icon="mdi-key-outline"
            variant="outlined"
            density="comfortable"
            autocomplete="current-password"
            type="password"
            required
            class="mb-2"
          />

          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            border="start"
            class="mb-4"
          >
            {{ errorMessage }}
          </v-alert>

          <v-alert
            v-if="isAuthenticated"
            type="success"
            variant="tonal"
            border="start"
            class="mb-4"
          >
            Connecté avec succès.
          </v-alert>

          <UiButton
            type="submit"
            block
            color="primary"
            size="lg"
            class="text-none font-weight-bold mb-3"
            :loading="loading"
            :disabled="!hasCredentials || isAuthenticated"
          >
            Login
          </UiButton>

          <UiButton
            block
            variant="outlined"
            size="lg"
            class="text-none"
            :disabled="!isAuthenticated"
            @click="logout"
          >
            Logout
          </UiButton>
        </v-form>
      </v-card-text>
    </UiCard>
  </v-container>
</template>

<style scoped>
.login-card {
  width: 100%;
  max-width: 460px;
  backdrop-filter: blur(12px);
  background: color-mix(
    in srgb,
    rgb(var(--v-theme-surface)) 88%,
    rgb(var(--v-theme-surface-bright)) 12%
  );
}
</style>

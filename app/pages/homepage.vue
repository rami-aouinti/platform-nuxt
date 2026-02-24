<script setup lang="ts">
definePageMeta({
  icon: 'mdi-home',
  title: 'Homepage',
  drawerIndex: 0,
})

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const errorMessage = ref('')
const isConnected = ref(false)
const token = ref('')

const hasCredentials = computed(() => {
  return Boolean(form.username.trim()) && Boolean(form.password)
})

function syncToken(newToken: string) {
  token.value = newToken
  isConnected.value = Boolean(newToken)

  if (import.meta.client) {
    if (newToken) {
      localStorage.setItem('auth_token', newToken)
      return
    }
    localStorage.removeItem('auth_token')
  }
}

onMounted(() => {
  const storedToken = localStorage.getItem('auth_token')
  if (storedToken) {
    syncToken(storedToken)
  }
})

async function login() {
  if (!hasCredentials.value || loading.value) {
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch<{ token?: string }>('http://localhost/api/v1/auth/get_token', {
      method: 'POST',
      body: {
        username: form.username,
        password: form.password,
      },
    })

    if (!response?.token) {
      errorMessage.value = 'Connexion échouée : token absent de la réponse API.'
      syncToken('')
      return
    }

    syncToken(response.token)
    form.password = ''
  }
  catch {
    errorMessage.value = 'Connexion échouée : identifiants invalides ou API inaccessible.'
    syncToken('')
  }
  finally {
    loading.value = false
  }
}

function logout() {
  syncToken('')
  form.password = ''
  errorMessage.value = ''
}
</script>

<template>
  <v-container fluid class="login-page d-flex align-center justify-center pa-6">
    <v-card class="login-card" elevation="18" rounded="xl">
      <v-card-text class="pa-8 pa-md-10">
        <div class="text-center mb-8">
          <v-avatar size="68" class="mx-auto mb-4 gradient-avatar">
            <v-icon icon="mdi-lock-check-outline" size="34" color="white" />
          </v-avatar>
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
            v-if="isConnected"
            type="success"
            variant="tonal"
            border="start"
            class="mb-4"
          >
            Connecté avec succès.
          </v-alert>

          <v-btn
            type="submit"
            block
            color="primary"
            size="large"
            class="text-none font-weight-bold mb-3"
            :loading="loading"
            :disabled="!hasCredentials || isConnected"
          >
            Login
          </v-btn>

          <v-btn
            block
            variant="outlined"
            size="large"
            class="text-none"
            :disabled="!isConnected"
            @click="logout"
          >
            Logout
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.login-page {
  min-height: calc(100vh - 64px);
  background: radial-gradient(circle at 10% 20%, rgb(209 233 255 / 65%), transparent 42%),
    radial-gradient(circle at 90% 15%, rgb(213 174 255 / 35%), transparent 38%),
    linear-gradient(135deg, rgb(250 251 255 / 90%), rgb(238 244 255 / 95%));
}

.login-card {
  width: 100%;
  max-width: 460px;
  backdrop-filter: blur(12px);
  border: 1px solid rgb(var(--v-theme-primary), 0.15);
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 92%, white 8%);
}

.gradient-avatar {
  background: linear-gradient(140deg, rgb(var(--v-theme-primary)), #7f7bff);
}
</style>

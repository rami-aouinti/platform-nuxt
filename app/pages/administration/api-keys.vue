<script setup lang="ts">
import { storeToRefs } from 'pinia'
import ApiKeysManager from '~/components/Administration/ApiKeysManager.vue'
import { useAuthStore } from '~/stores/auth'
import { apiKeysV1Service, apiKeysV2Service } from '~~/services/admin'

definePageMeta({
  icon: 'mdi-key-variant',
  title: 'Api keys',
  drawerIndex: 74,
  requiresAuth: true,
  requiresAdmin: true,
  middleware: ['auth', 'admin-access'],
})

const authStore = useAuthStore()
const { roles } = storeToRefs(authStore)
const activeVersion = ref<'v1' | 'v2'>('v1')

const isRoot = computed(() => roles.value.includes('ROLE_ROOT'))

onMounted(async () => {
  await authStore.ensureRolesLoaded()
})
</script>

<template>
  <v-container fluid class="pa-6">
    <v-card rounded="xl" elevation="6" class="pa-6">
      <div class="d-flex justify-space-between align-center flex-wrap ga-3 mb-4">
        <h1 class="text-h4 font-weight-bold">Administration · API keys</h1>
        <v-chip color="error" variant="tonal">ROOT only</v-chip>
      </div>

      <v-alert
        v-if="!isRoot"
        type="warning"
        variant="tonal"
        density="comfortable"
        class="mb-4"
      >
        Cette section est réservée au rôle ROLE_ROOT. Toutes les actions sont bloquées.
      </v-alert>

      <div class="d-flex align-center ga-3 mb-4 flex-wrap">
        <span class="text-subtitle-2">Version API:</span>
        <v-btn-toggle v-model="activeVersion" mandatory color="primary" density="comfortable" divided>
          <v-btn value="v1">v1</v-btn>
          <v-btn value="v2">v2</v-btn>
        </v-btn-toggle>
      </div>

      <ApiKeysManager
        v-if="activeVersion === 'v1'"
        version="v1"
        api-prefix="/api/v1"
        :service="apiKeysV1Service"
        :is-root="isRoot"
      />
      <ApiKeysManager
        v-else
        version="v2"
        api-prefix="/api/v2"
        :service="apiKeysV2Service"
        :is-root="isRoot"
      />
    </v-card>
  </v-container>
</template>

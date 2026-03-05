<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { getProfileEndpointCandidates } from '~/services/profile/profile-endpoint-resolver'

const authStore = useAuthStore()
const loading = ref(false)
const setting = ref({
  enabled: false,
  securityKeys: 0,
  smsNumber: '',
  authenticatorConfigured: false,
})

async function loadTwoFactorSettings() {
  if (!authStore.token) {
    return
  }

  loading.value = true

  const endpoints = getProfileEndpointCandidates('twoFactor')

  try {
    for (const endpoint of endpoints) {
      try {
        const response = await $fetch<Record<string, unknown>>(endpoint, {
          headers: { Authorization: `Bearer ${authStore.token}` },
        })

        setting.value.enabled = Boolean(response.enabled)
        setting.value.securityKeys = Number(response.securityKeys ?? response.securityKeyCount ?? 0)
        setting.value.smsNumber = String(response.smsNumber ?? '')
        setting.value.authenticatorConfigured = Boolean(response.authenticatorConfigured)
        return
      } catch {
        continue
      }
    }
  } finally {
    loading.value = false
  }
}

async function toggleTwoFactor() {
  if (!authStore.token) {
    return
  }

  const nextValue = !setting.value.enabled
  const endpoints = getProfileEndpointCandidates('twoFactor')

  try {
    for (const endpoint of endpoints) {
      try {
        await $fetch(endpoint, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${authStore.token}` },
          body: { enabled: nextValue },
        })
        setting.value.enabled = nextValue
        Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.twoFactorToggled', { state: nextValue ? useNuxtApp().$i18n.t('notifications.ui.twoFactorEnabled') : useNuxtApp().$i18n.t('notifications.ui.twoFactorDisabled') })))
        return
      } catch {
        continue
      }
    }
    throw new Error('Impossible de mettre à jour la configuration 2FA.')
  } catch (error) {
    Notify.error(error)
  }
}

onMounted(loadTwoFactorSettings)
</script>

<template>
  <v-card class="profile-block pa-4 pa-md-6" rounded="xl">
    <div class="d-flex align-center justify-space-between mb-8">
      <h3 class="text-h4 text-typo">Two-factor authentication</h3>
      <v-chip :color="setting.enabled ? 'success' : 'grey'" variant="tonal">{{ setting.enabled ? 'Enabled' : 'Disabled' }}</v-chip>
    </div>

    <div v-if="loading" class="d-flex align-center ga-3">
      <v-progress-circular indeterminate size="24" color="primary" />
      <span>Chargement...</span>
    </div>

    <div v-else class="d-flex flex-column ga-6">
      <div class="d-flex align-center justify-space-between ga-4">
        <span class="text-body-1">Security keys</span>
        <div class="d-flex align-center ga-4">
          <span class="text-medium-emphasis">{{ setting.securityKeys > 0 ? `${setting.securityKeys} key(s)` : 'No Security Keys' }}</span>
          <v-btn variant="outlined" size="small">Add</v-btn>
        </div>
      </div>
      <v-divider />
      <div class="d-flex align-center justify-space-between ga-4">
        <span class="text-body-1">SMS Number</span>
        <div class="d-flex align-center ga-4">
          <span class="text-medium-emphasis">{{ setting.smsNumber || 'Not Configured' }}</span>
          <v-btn variant="outlined" size="small">Edit</v-btn>
        </div>
      </div>
      <v-divider />
      <div class="d-flex align-center justify-space-between ga-4">
        <span class="text-body-1">Authenticator app</span>
        <div class="d-flex align-center ga-4">
          <span class="text-medium-emphasis">{{ setting.authenticatorConfigured ? 'Configured' : 'Not Configured' }}</span>
          <v-btn variant="outlined" size="small">Set Up</v-btn>
        </div>
      </div>

      <div class="d-flex justify-end">
        <v-btn color="primary" @click="toggleTwoFactor">{{ setting.enabled ? 'Disable' : 'Enable' }} 2FA</v-btn>
      </div>
    </div>
  </v-card>
</template>

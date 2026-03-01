<script setup lang="ts">
import { Notify } from '~/stores/notification'

const authStore = useAuthStore()
const loading = ref(false)
const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const canSubmit = computed(() => {
  return form.currentPassword.length > 0 && form.newPassword.length >= 6 && form.newPassword === form.confirmPassword
})

async function tryPasswordUpdate(path: string) {
  return await $fetch(path, {
    method: 'PATCH',
    headers: authStore.token ? { Authorization: `Bearer ${authStore.token}` } : undefined,
    body: {
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    },
  })
}

async function updatePassword() {
  if (!canSubmit.value) {
    return
  }

  loading.value = true

  const endpoints = ['/api/v1/me/profile/password', '/api/v1/me/password', '/api/v2/me/password']

  try {
    let success = false
    for (const endpoint of endpoints) {
      try {
        await tryPasswordUpdate(endpoint)
        success = true
        break
      } catch {
        continue
      }
    }

    if (!success) {
      throw new Error('Aucun endpoint de changement de mot de passe disponible.')
    }

    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
    Notify.success('Mot de passe mis à jour.')
  } catch (error) {
    Notify.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-card class="profile-block pa-4 pa-md-6" rounded="xl" elevation="0">
    <h3 class="text-h4 text-typo mb-6">Change Password</h3>

    <v-form @submit.prevent="updatePassword">
      <v-text-field v-model="form.currentPassword" label="Current password" type="password" class="mb-4" />
      <v-text-field v-model="form.newPassword" label="New password" type="password" class="mb-4" />
      <v-text-field v-model="form.confirmPassword" label="Confirm new password" type="password" class="mb-8" />

      <h4 class="text-h5 text-typo mb-2">Password requirements</h4>
      <p class="text-body-1 text-medium-emphasis mb-3">Please follow this guide for a strong password:</p>
      <ul class="text-body-1 text-medium-emphasis mb-8 ps-6">
        <li>One special character</li>
        <li>Min 6 characters</li>
        <li>One number (2 are recommended)</li>
        <li>Change it often</li>
      </ul>

      <div class="d-flex justify-end">
        <v-btn color="primary" type="submit" :loading="loading" :disabled="!canSubmit">Update password</v-btn>
      </div>
    </v-form>
  </v-card>
</template>

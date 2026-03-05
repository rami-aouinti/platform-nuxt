<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { getProfileEndpointCandidates } from '~/services/profile/profile-endpoint-resolver'

const authStore = useAuthStore()
const route = useRouter()
const loadingAction = ref<'deactivate' | 'delete' | null>(null)

async function runAction(action: 'deactivate' | 'delete') {
  if (!authStore.token) {
    return
  }

  loadingAction.value = action
  const endpoints = action === 'deactivate'
    ? getProfileEndpointCandidates('deactivateAccount')
    : getProfileEndpointCandidates('deleteAccount')

  const method = action === 'deactivate' ? 'POST' : 'DELETE'

  try {
    for (const endpoint of endpoints) {
      try {
        await $fetch(endpoint, {
          method,
          headers: { Authorization: `Bearer ${authStore.token}` },
        })
        Notify.success(action === 'deactivate' ? 'Compte désactivé.' : 'Compte supprimé.')
        authStore.logout()
        await route.push('/sign-in')
        return
      } catch {
        continue
      }
    }

    throw new Error('Action indisponible: endpoint introuvable.')
  } catch (error) {
    Notify.error(error)
  } finally {
    loadingAction.value = null
  }
}
</script>

<template>
  <v-card class="profile-block pa-4 pa-md-6" rounded="xl">
    <div class="d-flex flex-wrap align-center justify-space-between ga-4">
      <div>
        <h3 class="text-h4 text-typo mb-2">Delete Account</h3>
        <p class="text-body-1 text-medium-emphasis mb-0">Once you delete your account, there is no going back. Please be certain.</p>
      </div>
      <div class="d-flex ga-3">
        <v-btn
          variant="outlined"
          :loading="loadingAction === 'deactivate'"
          @click="runAction('deactivate')"
        >
          Deactivate
        </v-btn>
        <v-btn
          color="error"
          :loading="loadingAction === 'delete'"
          @click="runAction('delete')"
        >
          Delete Account
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

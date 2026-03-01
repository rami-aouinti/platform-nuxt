<script setup lang="ts">
import { Notify } from '~/stores/notification'

type SocialAccount = {
  provider?: string
  email?: string
  username?: string
  enabled?: boolean
  verificationCode?: string
}

const authStore = useAuthStore()
const loading = ref(false)
const deletingProvider = ref<string | null>(null)
const linking = ref(false)
const verificationCode = ref('')
const selectedProvider = ref('slack')

const accounts = ref<SocialAccount[]>([])
const providerOptions = [
  { provider: 'slack', title: 'Slack', subtitle: 'Workspace messaging', icon: 'mdi-slack' },
  { provider: 'spotify', title: 'Spotify', subtitle: 'Music', icon: 'mdi-spotify' },
  { provider: 'atlassian', title: 'Atlassian', subtitle: 'Payment vendor', icon: 'mdi-atlassian' },
  { provider: 'asana', title: 'Asana', subtitle: 'Organize your team', icon: 'mdi-alpha-a-circle' },
]

const accountMap = computed(() => {
  const mapped = new Map<string, SocialAccount>()
  for (const account of accounts.value) {
    if (account.provider) {
      mapped.set(account.provider.toLowerCase(), account)
    }
  }
  return mapped
})

async function loadAccounts() {
  if (!authStore.token) {
    return
  }

  loading.value = true

  try {
    const response = await $fetch<{ items?: SocialAccount[] }>('/api/v1/me/social-accounts', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    accounts.value = response.items ?? []
  } catch (error) {
    Notify.error(error)
  } finally {
    loading.value = false
  }
}

async function unlinkProvider(provider: string) {
  if (!authStore.token) {
    return
  }

  deletingProvider.value = provider
  try {
    await $fetch(`/api/v1/me/social-accounts/${encodeURIComponent(provider)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    Notify.success(`${provider} déconnecté.`)
    await loadAccounts()
  } catch (error) {
    Notify.error(error)
  } finally {
    deletingProvider.value = null
  }
}

async function linkProvider() {
  if (!authStore.token || !verificationCode.value.trim()) {
    return
  }

  linking.value = true

  try {
    await $fetch('/api/v1/me/social-accounts/link', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: {
        provider: selectedProvider.value,
        code: verificationCode.value.trim(),
      },
    })
    verificationCode.value = ''
    Notify.success('Compte lié avec succès.')
    await loadAccounts()
  } catch (error) {
    Notify.error(error)
  } finally {
    linking.value = false
  }
}

onMounted(loadAccounts)
</script>

<template>
  <v-card class="profile-block pa-4 pa-md-6" rounded="xl" elevation="0">
    <h3 class="text-h4 text-typo mb-2">Accounts</h3>
    <p class="text-body-1 text-medium-emphasis mb-6">Here you can setup and manage your integration settings.</p>

    <div v-if="loading" class="d-flex align-center ga-3">
      <v-progress-circular indeterminate size="24" color="primary" />
      <span>Chargement...</span>
    </div>

    <div v-else>
      <div class="mb-8">
        <p class="text-body-1 mb-2">Connect an account</p>
        <div class="d-flex ga-3 flex-wrap align-center">
          <v-select v-model="selectedProvider" :items="providerOptions" item-title="title" item-value="provider" label="Provider" density="comfortable" style="max-width: 220px" />
          <v-text-field v-model="verificationCode" label="Verification code" density="comfortable" style="max-width: 260px" />
          <v-btn color="primary" :loading="linking" :disabled="!verificationCode.trim()" @click="linkProvider">Link</v-btn>
        </div>
      </div>

      <v-divider class="mb-6" />

      <div v-for="item in providerOptions" :key="item.provider" class="py-4">
        <div class="d-flex align-center ga-4">
          <v-icon :icon="item.icon" size="34" class="text-medium-emphasis" />
          <div>
            <p class="text-h5 text-typo mb-0">{{ item.title }}</p>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ item.subtitle }}</p>
          </div>
          <p class="ms-auto text-medium-emphasis mb-0">{{ accountMap.get(item.provider)?.email || accountMap.get(item.provider)?.username || 'Not connected' }}</p>
          <v-btn
            v-if="accountMap.has(item.provider)"
            color="error"
            variant="tonal"
            :loading="deletingProvider === item.provider"
            @click="unlinkProvider(item.provider)"
          >
            Delete
          </v-btn>
          <v-chip v-else color="grey" variant="outlined">Disabled</v-chip>
        </div>
        <v-divider class="mt-4" />
      </div>
    </div>
  </v-card>
</template>

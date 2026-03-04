<script setup lang="ts">
definePageMeta({
  title: 'Profil utilisateur',
  icon: 'mdi-account-outline',
})

type UserProfilePayload = {
  id?: string | number
  username?: string
  firstName?: string
  lastName?: string
  email?: string
  biography?: string
  description?: string
  avatarUrl?: string
  avatar_url?: string
}

const route = useRoute()

const username = computed(() => {
  const raw = route.params.username
  return Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')
})

const endpoint = computed(() => `/api/v1/user/${encodeURIComponent(username.value)}/profile`)

const { data, pending, error, refresh } = await useFetch<UserProfilePayload>(endpoint, {
  key: computed(() => `public-user-profile:${username.value}`),
  watch: [username],
})

const displayName = computed(() => {
  const first = String(data.value?.firstName ?? '').trim()
  const last = String(data.value?.lastName ?? '').trim()
  const fullName = `${first} ${last}`.trim()

  if (fullName) {
    return fullName
  }

  return String(data.value?.username ?? username.value)
})

const avatar = computed(() => {
  const fromSnakeCase = data.value?.avatar_url
  const fromCamelCase = data.value?.avatarUrl
  return String(fromCamelCase ?? fromSnakeCase ?? '').trim()
})

const biography = computed(() => {
  const raw = data.value?.biography ?? data.value?.description
  return String(raw ?? '').trim()
})
</script>

<template>
  <v-container class="py-6" max-width="900">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between ga-4 flex-wrap">
        <span>Profil de {{ username }}</span>
        <v-btn variant="text" prepend-icon="mdi-refresh" :loading="pending" @click="refresh()">
          Rafraîchir
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          Impossible de charger le profil utilisateur.
        </v-alert>

        <div v-else-if="pending" class="d-flex justify-center py-8">
          <v-progress-circular indeterminate color="primary" size="36" />
        </div>

        <v-row v-else>
          <v-col cols="12" md="4" class="d-flex justify-center">
            <v-avatar size="120" color="grey-lighten-3">
              <v-img v-if="avatar" :src="avatar" :alt="displayName" cover />
              <span v-else class="text-h5">{{ displayName.charAt(0).toUpperCase() }}</span>
            </v-avatar>
          </v-col>

          <v-col cols="12" md="8">
            <div class="text-h5 font-weight-bold mb-1">{{ displayName }}</div>
            <div class="text-medium-emphasis mb-4">@{{ data?.username ?? username }}</div>

            <v-list density="compact" lines="one">
              <v-list-item prepend-icon="mdi-identifier" title="ID" :subtitle="String(data?.id ?? '-')" />
              <v-list-item prepend-icon="mdi-email-outline" title="Email" :subtitle="String(data?.email ?? '-')" />
              <v-list-item
                prepend-icon="mdi-card-account-details-outline"
                title="Bio"
                :subtitle="biography || 'Aucune biographie disponible.'"
              />
            </v-list>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

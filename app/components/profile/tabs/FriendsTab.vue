<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { FriendRequest, FriendUser } from '~/composables/api/useFriendsApi'
import { useProfileFriendsStore } from '~/stores/profileFriends'

const { t } = useI18n()
const profileFriendsStore = useProfileFriendsStore()
const {
  rows: friends,
  sentRequests,
  receivedRequests,
  loading,
  actionLoading,
} = storeToRefs(profileFriendsStore)

const userIdToInvite = ref('')

function getUserDisplay(user?: FriendUser | null) {
  if (!user) return t('profile.friends.unknownUser')

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  if (fullName.length > 0) return fullName
  if (user.username) return user.username
  if (user.email) return user.email
  return user.id || t('profile.friends.unknownUser')
}

function getRequestUser(request: FriendRequest, mode: 'received' | 'sent') {
  if (mode === 'received') {
    return request.fromUser ?? request.user ?? null
  }

  return request.toUser ?? request.user ?? null
}

function getUserInitials(user?: FriendUser | null) {
  if (!user) return '?'

  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((name) => String(name).trim().charAt(0).toUpperCase())
    .join('')

  if (initials) return initials.slice(0, 2)
  if (user.username) return user.username.trim().charAt(0).toUpperCase()
  if (user.email) return user.email.trim().charAt(0).toUpperCase()

  return '?'
}

async function loadFriendsData() {
  await profileFriendsStore.fetchRows()
}

async function sendRequest() {
  const userId = userIdToInvite.value.trim()

  if (!userId) {
    return
  }

  await profileFriendsStore.create({ userId })
  userIdToInvite.value = ''
}

async function acceptRequest(request: FriendRequest) {
  await profileFriendsStore.update(request.id)
}

async function removeFriend(userId: string) {
  await profileFriendsStore.remove(userId)
}

onMounted(loadFriendsData)
</script>

<template>
  <v-card class="profile-block workspace-sidebar-card friends-card pa-4 pa-md-6" rounded="lg">
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <h3 class="text-h4 text-typo mb-0">{{ t('profile.friends.title') }}</h3>
      <v-btn
        color="secondary"
        variant="text"
        prepend-icon="mdi-refresh"
        :loading="loading"
        :disabled="actionLoading"
        @click="loadFriendsData"
      >
        {{ t('profile.friends.refresh') }}
      </v-btn>
    </div>

    <div class="d-flex ga-3 mb-6 flex-wrap">
      <v-text-field
        v-model="userIdToInvite"
        :label="t('profile.friends.userIdInput')"
        density="comfortable"
        hide-details
        class="flex-grow-1"
      />
      <v-btn
        color="primary"
        prepend-icon="mdi-account-plus"
        :loading="actionLoading"
        :disabled="loading"
        @click="sendRequest"
      >
        {{ t('profile.friends.sendRequest') }}
      </v-btn>
    </div>

    <div v-if="loading" class="d-flex align-center ga-3 mb-6">
      <v-progress-circular indeterminate size="24" color="primary" />
      <span>{{ t('profile.friends.loading') }}</span>
    </div>

    <v-row v-else class="friends-columns-row">
      <v-col cols="12" md="4">
        <h4 class="text-h6 mb-3">{{ t('profile.friends.friendsList') }}</h4>
        <v-list v-if="friends.length" density="comfortable" class="bg-transparent pa-0 d-flex flex-column ga-2">
          <v-list-item v-for="friend in friends" :key="friend.id" class="friend-item px-3 py-2" rounded="lg">
            <template #prepend>
              <v-avatar size="42" class="mr-3">
                <v-img v-if="friend.photo" :src="friend.photo" :alt="getUserDisplay(friend)" cover />
                <span v-else class="text-subtitle-2 font-weight-bold">{{ getUserInitials(friend) }}</span>
              </v-avatar>
            </template>
            <template #title>
              {{ getUserDisplay(friend) }}
            </template>
            <template #append>
              <v-btn
                icon="mdi-account-remove"
                color="error"
                variant="text"
                :disabled="actionLoading"
                @click="removeFriend(friend.id)"
              />
            </template>
          </v-list-item>
        </v-list>
        <v-alert v-else type="info" variant="tonal">{{ t('profile.friends.emptyFriends') }}</v-alert>
      </v-col>

      <v-col cols="12" md="4">
        <h4 class="text-h6 mb-3">{{ t('profile.friends.sentRequests') }}</h4>
        <v-list v-if="sentRequests.length" density="comfortable" class="bg-transparent pa-0 d-flex flex-column ga-2">
          <v-list-item v-for="request in sentRequests" :key="request.id" class="friend-item px-3 py-2" rounded="lg">
            <template #prepend>
              <v-avatar size="42" class="mr-3">
                <v-img
                  v-if="getRequestUser(request, 'sent')?.photo"
                  :src="getRequestUser(request, 'sent')?.photo || undefined"
                  :alt="getUserDisplay(getRequestUser(request, 'sent'))"
                  cover
                />
                <span v-else class="text-subtitle-2 font-weight-bold">{{ getUserInitials(getRequestUser(request, 'sent')) }}</span>
              </v-avatar>
            </template>
            <template #title>
              {{ getRequestUser(request, 'sent') ? getUserDisplay(getRequestUser(request, 'sent')) : '-' }}
            </template>
          </v-list-item>
        </v-list>
        <v-alert v-else type="info" variant="tonal">{{ t('profile.friends.emptySentRequests') }}</v-alert>
      </v-col>

      <v-col cols="12" md="4">
        <h4 class="text-h6 mb-3">{{ t('profile.friends.receivedRequests') }}</h4>
        <v-list v-if="receivedRequests.length" density="comfortable" class="bg-transparent pa-0 d-flex flex-column ga-2">
          <v-list-item v-for="request in receivedRequests" :key="request.id" class="friend-item px-3 py-2" rounded="lg">
            <template #prepend>
              <v-avatar size="42" class="mr-3">
                <v-img
                  v-if="getRequestUser(request, 'received')?.photo"
                  :src="getRequestUser(request, 'received')?.photo || undefined"
                  :alt="getUserDisplay(getRequestUser(request, 'received'))"
                  cover
                />
                <span v-else class="text-subtitle-2 font-weight-bold">{{ getUserInitials(getRequestUser(request, 'received')) }}</span>
              </v-avatar>
            </template>
            <template #title>
              {{ getRequestUser(request, 'received') ? getUserDisplay(getRequestUser(request, 'received')) : '-' }}
            </template>
            <template #append>
              <v-btn
                icon="mdi-check"
                color="success"
                variant="text"
                :disabled="actionLoading"
                @click="acceptRequest(request)"
              />
            </template>
          </v-list-item>
        </v-list>
        <v-alert v-else type="info" variant="tonal">{{ t('profile.friends.emptyReceivedRequests') }}</v-alert>
      </v-col>
    </v-row>
  </v-card>
</template>

<style scoped>
.friends-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  backdrop-filter: blur(10px);
}

.friends-columns-row > :deep(.v-col) {
  position: relative;
}

.friend-item {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  background: rgba(var(--v-theme-on-surface), 0.02);
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.friend-item:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  background: rgba(var(--v-theme-primary), 0.08);
  transform: translateY(-1px);
}
</style>

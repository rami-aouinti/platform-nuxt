<script setup lang="ts">
import { Notify } from '~/stores/notification'
import type { FriendRequest, FriendUser } from '~/composables/api/useFriendsApi'
import { useFriendsApi } from '~/composables/api/useFriendsApi'

const { t } = useI18n()
const friendsApi = useFriendsApi()

const friends = ref<FriendUser[]>([])
const sentRequests = ref<FriendRequest[]>([])
const receivedRequests = ref<FriendRequest[]>([])
const loading = ref(false)
const actionLoading = ref(false)
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

async function loadFriendsData() {
  loading.value = true

  try {
    const [friendsResult, sentResult, receivedResult] = await Promise.all([
      friendsApi.listFriends(),
      friendsApi.listSentRequests(),
      friendsApi.listReceivedRequests(),
    ])

    friends.value = friendsResult
    sentRequests.value = sentResult
    receivedRequests.value = receivedResult
  } catch (error) {
    Notify.error(error)
  } finally {
    loading.value = false
  }
}

async function sendRequest() {
  const userId = userIdToInvite.value.trim()

  if (!userId) {
    Notify.error(t('profile.friends.errors.userIdRequired'))
    return
  }

  actionLoading.value = true

  try {
    await friendsApi.sendFriendRequest(userId)
    userIdToInvite.value = ''
    await loadFriendsData()
    Notify.success(t('profile.friends.actions.requestSent'))
  } catch (error) {
    Notify.error(error)
  } finally {
    actionLoading.value = false
  }
}

async function acceptRequest(request: FriendRequest) {
  actionLoading.value = true

  try {
    await friendsApi.acceptFriendRequest(request.id)
    await loadFriendsData()
    Notify.success(t('profile.friends.actions.requestAccepted'))
  } catch (error) {
    Notify.error(error)
  } finally {
    actionLoading.value = false
  }
}

async function removeFriend(userId: string) {
  actionLoading.value = true

  try {
    await friendsApi.deleteFriend(userId)
    await loadFriendsData()
    Notify.success(t('profile.friends.actions.friendRemoved'))
  } catch (error) {
    Notify.error(error)
  } finally {
    actionLoading.value = false
  }
}

onMounted(loadFriendsData)
</script>

<template>
  <v-card class="profile-block pa-4 pa-md-6" rounded="xl" elevation="0">
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

    <v-row v-else>
      <v-col cols="12" md="4">
        <h4 class="text-h6 mb-3">{{ t('profile.friends.friendsList') }}</h4>
        <v-list v-if="friends.length" density="comfortable" class="bg-transparent pa-0">
          <v-list-item v-for="friend in friends" :key="friend.id" class="px-0">
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
        <v-list v-if="sentRequests.length" density="comfortable" class="bg-transparent pa-0">
          <v-list-item v-for="request in sentRequests" :key="request.id" class="px-0">
            <template #title>
              {{ getUserDisplay(getRequestUser(request, 'sent')) }}
            </template>
          </v-list-item>
        </v-list>
        <v-alert v-else type="info" variant="tonal">{{ t('profile.friends.emptySentRequests') }}</v-alert>
      </v-col>

      <v-col cols="12" md="4">
        <h4 class="text-h6 mb-3">{{ t('profile.friends.receivedRequests') }}</h4>
        <v-list v-if="receivedRequests.length" density="comfortable" class="bg-transparent pa-0">
          <v-list-item v-for="request in receivedRequests" :key="request.id" class="px-0">
            <template #title>
              {{ getUserDisplay(getRequestUser(request, 'received')) }}
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

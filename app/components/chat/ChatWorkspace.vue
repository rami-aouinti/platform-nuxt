<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import {
  useChatApi,
  type ChatConversation,
  type ChatMessage,
  type ChatParticipant,
} from '~/composables/api/useChatApi'
import {
  useFriendsApi,
  type FriendUser,
} from '~/composables/api/useFriendsApi'
import { toUiErrorMessage } from '~/utils/errors/toUiErrorMessage'

const route = useRoute()
const chatApi = useChatApi()
const friendsApi = useFriendsApi()
const authStore = useAuthStore()
const { profile } = storeToRefs(authStore)

const loadingConversations = ref(false)
const loadingMessages = ref(false)
const loadingFriends = ref(false)
const sending = ref(false)
const deletingMessageId = ref<string | null>(null)

const conversations = ref<ChatConversation[]>([])
const activeConversationId = ref<string>('')
const messages = ref<ChatMessage[]>([])
const draftMessage = ref('')
const friendSearch = ref('')
const friends = ref<FriendUser[]>([])
const selectedFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const messagesContainerRef = ref<HTMLElement | null>(null)
const conversationEventSource = ref<EventSource | null>(null)

const availableReactions = ['thumbs_up', 'heart', 'surprised', 'sad']

const hasConversations = computed(() => conversations.value.length > 0)
const filteredFriends = computed(() => {
  const query = friendSearch.value.trim().toLowerCase()
  if (!query) return friends.value

  return friends.value.filter((friend) => {
    const fields = [friend.username, friend.firstName, friend.lastName, friend.email]
      .filter((field): field is string => Boolean(field))
      .map((field) => field.toLowerCase())

    return fields.some((field) => field.includes(query))
  })
})

const shouldShowFriendResults = computed(() => friendSearch.value.trim().length > 0)
const activeConversation = computed(() =>
  conversations.value.find(
    (conversation) => conversation.id === activeConversationId.value,
  ),
)

function toFrenchDate(value?: string | null) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getConversationDisplayParticipants(conversation?: ChatConversation | null): ChatParticipant[] {
  if (!conversation?.participants) return []
  const notCurrent = conversation.participants.filter((participant) => !participant.isCurrentUser)
  return notCurrent.length > 0 ? notCurrent : conversation.participants
}

function participantDisplayName(participant: ChatParticipant): string {
  return `${participant.firstName ?? ''} ${participant.lastName ?? ''}`.trim()
    || participant.username
    || 'Utilisateur'
}

function friendDisplayName(friend: FriendUser): string {
  return `${friend.firstName ?? ''} ${friend.lastName ?? ''}`.trim()
    || friend.username
    || friend.email
    || 'Utilisateur'
}

function conversationDisplayName(conversation?: ChatConversation | null): string {
  if (!conversation) return ''
  const names = getConversationDisplayParticipants(conversation)
    .map((participant) => participantDisplayName(participant))
    .filter(Boolean)

  if (names.length > 0) return names.join(', ')
  return conversation.title || `Conversation #${conversation.id}`
}

function getUnreadCount(conversation: ChatConversation): number {
  return typeof conversation.unreadCount === 'number' && Number.isFinite(conversation.unreadCount)
    ? conversation.unreadCount
    : 0
}

function isMine(message: ChatMessage) {
  const currentUserId = profile.value?.id

  if (message.isFromCurrentUser) return true

  if (currentUserId && message.senderId) {
    return currentUserId === message.senderId
  }

  if (!message.role) return false
  return ['me', 'user', 'candidate', 'owner'].includes(message.role.toLowerCase())
}

function triggerFilePicker() {
  fileInput.value?.click()
}

function onFileSelection(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files ?? [])
  if (files.length === 0) return

  selectedFiles.value = [...selectedFiles.value, ...files]
  target.value = ''
}

function removeSelectedFile(index: number) {
  selectedFiles.value = selectedFiles.value.filter((_, fileIndex) => fileIndex !== index)
}

function reactionEmoji(reaction: string): string {
  const map: Record<string, string> = {
    thumbs_up: '👍',
    heart: '❤️',
    surprised: '😮',
    sad: '😢',
  }

  return map[reaction] || '🙂'
}

function attachmentLabel(attachment: ChatMessage['attachments'][number]): string {
  return attachment.name || attachment.url || 'Pièce jointe'
}

function isImageAttachment(attachment: ChatMessage['attachments'][number]): boolean {
  const mime = attachment.mimeType || attachment.type || ''
  if (mime.toLowerCase().startsWith('image/')) return true

  return /\.(avif|bmp|gif|ico|jpe?g|png|svg|webp)$/i.test(attachment.url)
}

function attachmentIcon(attachment: ChatMessage['attachments'][number]): string {
  if (isImageAttachment(attachment)) return 'mdi-image-outline'
  const mime = (attachment.mimeType || attachment.type || '').toLowerCase()
  if (mime.includes('pdf')) return 'mdi-file-pdf-box'
  if (mime.includes('sheet') || mime.includes('excel') || mime.includes('csv')) return 'mdi-file-excel-outline'
  if (mime.includes('word') || mime.includes('document')) return 'mdi-file-word-outline'
  return 'mdi-paperclip'
}

function scrollToLatestMessage() {
  nextTick(() => {
    const container = messagesContainerRef.value
    if (!container) return
    container.scrollTop = container.scrollHeight
  })
}

function uiErrorMessage(error: unknown, fallback: string): string {
  const resolvedMessage = toUiErrorMessage(error)
  return resolvedMessage || fallback
}

function closeRealtimeSubscription() {
  conversationEventSource.value?.close()
  conversationEventSource.value = null
}

function upsertIncomingMessage(rawPayload: unknown) {
  if (!rawPayload || typeof rawPayload !== 'object') return

  const payload = rawPayload as Record<string, unknown>
  const candidate = payload.message && typeof payload.message === 'object'
    ? payload.message as Record<string, unknown>
    : payload.data && typeof payload.data === 'object'
      ? payload.data as Record<string, unknown>
      : payload

  const normalized = chatApi.normalizeMessage(candidate)
  if (!normalized.id) return

  const existingIndex = messages.value.findIndex((message) => message.id === normalized.id)

  if (existingIndex >= 0) {
    messages.value = messages.value.map((message, index) => (index === existingIndex ? normalized : message))
    return
  }

  messages.value = [...messages.value, normalized]

  const targetConversation = conversations.value.find(
    (conversation) => conversation.id === activeConversationId.value,
  )

  if (targetConversation) {
    targetConversation.lastMessage = normalized.content
    targetConversation.updatedAt = normalized.createdAt ?? new Date().toISOString()
  }
}

function startRealtimeSubscription(conversationId: string) {
  if (!conversationId || !import.meta.client) return

  closeRealtimeSubscription()

  const streamUrl = `/api/v1/me/chat/conversations/${encodeURIComponent(conversationId)}/events`
  const source = new EventSource(streamUrl, { withCredentials: true })

  source.onmessage = (event) => {
    if (!event.data) return

    try {
      const parsed = JSON.parse(event.data) as unknown
      upsertIncomingMessage(parsed)
    } catch {
      // ignore non-JSON keepalive payloads
    }
  }

  source.onerror = () => {
    if (source.readyState === EventSource.CLOSED) {
      closeRealtimeSubscription()
    }
  }

  conversationEventSource.value = source
}

async function loadConversations() {
  loadingConversations.value = true

  try {
    conversations.value = await chatApi.listConversations()

    const queryConversationId = typeof route.query.conversationId === 'string'
      ? route.query.conversationId
      : ''

    if (queryConversationId) {
      const exists = conversations.value.some((conversation) => conversation.id === queryConversationId)
      if (exists) {
        activeConversationId.value = queryConversationId
      }
    }

    if (!activeConversationId.value && conversations.value.length > 0)
      activeConversationId.value = conversations.value[0]?.id ?? ''
  } catch (error) {
    Notify.error(uiErrorMessage(error, 'Impossible de charger les conversations'))
  } finally {
    loadingConversations.value = false
  }
}

async function loadFriends() {
  loadingFriends.value = true

  try {
    friends.value = await friendsApi.listFriends()
  } catch (error) {
    Notify.error(uiErrorMessage(error, 'Impossible de charger les amis'))
  } finally {
    loadingFriends.value = false
  }
}

async function loadConversationDetail(conversationId: string) {
  if (!conversationId) return

  loadingMessages.value = true

  try {
    const [detail, conversationMessages] = await Promise.all([
      chatApi.getConversation(conversationId),
      chatApi.listConversationMessages(conversationId),
    ])

    messages.value = conversationMessages.length > 0 ? conversationMessages : detail.messages
    scrollToLatestMessage()

    const targetConversation = conversations.value.find(
      (conversation) => conversation.id === conversationId,
    )

    if (targetConversation && detail.title) {
      targetConversation.title = detail.title
    }
  } catch (error) {
    Notify.error(
      uiErrorMessage(error, 'Impossible de charger les messages'),
    )
  } finally {
    loadingMessages.value = false
  }
}

async function selectConversation(conversationId: string) {
  if (conversationId === activeConversationId.value) return

  activeConversationId.value = conversationId
  await loadConversationDetail(conversationId)
}

async function selectFriend(friend: FriendUser) {
  if (!friend.id) return

  loadingMessages.value = true

  try {
    const conversation = await chatApi.getConversationByUser(friend.id)

    if (!conversation.id) return

    const exists = conversations.value.some((item) => item.id === conversation.id)
    if (!exists) {
      conversations.value = [conversation, ...conversations.value]
    }

    activeConversationId.value = conversation.id
    await loadConversationDetail(conversation.id)
    friendSearch.value = ''
  } catch (error) {
    Notify.error(uiErrorMessage(error, 'Impossible de charger la conversation de cet ami'))
  } finally {
    loadingMessages.value = false
  }
}

async function sendMessage() {
  const content = draftMessage.value.trim()
  const hasFiles = selectedFiles.value.length > 0
  if ((!content && !hasFiles) || !activeConversationId.value || sending.value) return

  sending.value = true

  try {
    const sent = await chatApi.sendMessage(activeConversationId.value, {
      content,
      files: selectedFiles.value,
    })

    messages.value = [...messages.value, sent]
    draftMessage.value = ''
    selectedFiles.value = []
    scrollToLatestMessage()

    const targetConversation = conversations.value.find(
      (conversation) => conversation.id === activeConversationId.value,
    )

    if (targetConversation) {
      targetConversation.lastMessage = content || sent.content
      targetConversation.updatedAt = new Date().toISOString()
    }
  } catch (error) {
    Notify.error(uiErrorMessage(error, 'Échec de l’envoi du message'))
  } finally {
    sending.value = false
  }
}

async function reactToMessage(message: ChatMessage, reaction: string) {
  if (!activeConversationId.value) return

  try {
    const updatedMessage = await chatApi.reactToMessage(activeConversationId.value, message.id, reaction)
    messages.value = messages.value.map((item) => (item.id === message.id ? updatedMessage : item))
  } catch (error) {
    Notify.error(uiErrorMessage(error, 'Impossible de réagir au message'))
  }
}

async function deleteMessage(message: ChatMessage) {
  if (!activeConversationId.value || !isMine(message) || deletingMessageId.value) return

  deletingMessageId.value = message.id

  try {
    await chatApi.deleteMessage(activeConversationId.value, message.id)
    messages.value = messages.value.filter((item) => item.id !== message.id)
  } catch (error) {
    Notify.error(uiErrorMessage(error, 'Impossible de supprimer le message'))
  } finally {
    deletingMessageId.value = null
  }
}

watch(
  activeConversationId,
  async (conversationId) => {
    if (!conversationId) {
      closeRealtimeSubscription()
      return
    }

    startRealtimeSubscription(conversationId)
    await loadConversationDetail(conversationId)
  },
  { immediate: true },
)

watch(
  () => messages.value.length,
  () => {
    scrollToLatestMessage()
  },
)

onMounted(async () => {
  await Promise.all([loadConversations(), loadFriends()])
})

onBeforeUnmount(() => {
  closeRealtimeSubscription()
})
</script>

<template>
  <v-row class="chat-workspace" no-gutters>
    <v-col cols="12" md="4" lg="3" class="chat-conversations-panel border-e">
      <v-sheet class="pa-4 h-100" color="surface">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <p class="text-subtitle-1 font-weight-bold mb-1">Conversations</p>
            <p class="text-caption text-medium-emphasis mb-0">
              Messagerie interne
            </p>
          </div>
          <v-btn
            icon="mdi-refresh"
            size="small"
            variant="text"
            :loading="loadingConversations"
            @click="loadConversations"
          />
        </div>

        <v-text-field
          v-model="friendSearch"
          label="Rechercher un ami"
          variant="outlined"
          density="comfortable"
          hide-details
          class="mb-3"
          prepend-inner-icon="mdi-account-search-outline"
          :loading="loadingFriends"
        />

        <v-list
          v-if="shouldShowFriendResults"
          density="compact"
          nav
          class="chat-friends-results mb-3"
        >
          <v-list-item
            v-for="friend in filteredFriends"
            :key="friend.id"
            rounded="lg"
            @click="selectFriend(friend)"
          >
            <template #prepend>
              <v-avatar
                color="secondary"
                variant="tonal"
                size="32"
                :image="friend.photo ?? undefined"
              >
                {{ friendDisplayName(friend).slice(0, 1).toUpperCase() || 'A' }}
              </v-avatar>
            </template>

            <v-list-item-title class="text-body-2">
              {{ friendDisplayName(friend) }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption text-medium-emphasis">
              {{ friend.email || friend.username || '' }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="filteredFriends.length === 0" rounded="lg">
            <v-list-item-title class="text-body-2 text-medium-emphasis">
              Aucun ami trouvé.
            </v-list-item-title>
          </v-list-item>
        </v-list>

        <v-skeleton-loader
          v-if="loadingConversations"
          type="list-item-three-line@5"
        />

        <v-list
          v-else-if="hasConversations"
          density="compact"
          nav
          class="chat-conversations"
        >
          <v-list-item
            v-for="conversation in conversations"
            :key="conversation.id"
            rounded="lg"
            :active="conversation.id === activeConversationId"
            @click="selectConversation(conversation.id)"
          >
            <template #prepend>
              <v-avatar
                color="primary"
                variant="tonal"
                size="36"
                :image="getConversationDisplayParticipants(conversation)[0]?.photo ?? undefined"
              >
                {{ conversationDisplayName(conversation).slice(0, 1).toUpperCase() || 'C' }}
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-medium text-truncate">
              {{ conversationDisplayName(conversation) }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-truncate">
              {{ conversation.lastMessage || 'Aucun message récent.' }}
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex flex-column align-end ga-1">
                <span class="text-caption text-medium-emphasis">{{
                  toFrenchDate(conversation.updatedAt)
                }}</span>
                <v-badge
                  v-if="getUnreadCount(conversation) > 0"
                  :content="getUnreadCount(conversation)"
                  inline
                  color="primary"
                />
              </div>
            </template>
          </v-list-item>
        </v-list>

        <v-empty-state
          v-else
          icon="mdi-chat-outline"
          title="Aucune conversation"
          text="Dès qu'une conversation existe, elle apparaîtra ici."
        />
      </v-sheet>
    </v-col>

    <v-col cols="12" md="8" lg="9">
      <v-sheet class="chat-thread d-flex flex-column h-100">
        <div class="chat-thread-header px-4 py-3 border-b d-flex align-center justify-space-between">
          <div>
            <p class="text-subtitle-1 font-weight-bold mb-0">
              {{ conversationDisplayName(activeConversation) || 'Sélectionnez une conversation' }}
            </p>
            <p class="text-caption text-medium-emphasis mb-0">
              {{ messages.length }} message{{ messages.length > 1 ? 's' : '' }}
            </p>
          </div>
          <v-icon icon="mdi-forum-outline" color="primary" />
        </div>

        <div ref="messagesContainerRef" class="chat-messages pa-4 flex-grow-1">
          <v-skeleton-loader
            v-if="loadingMessages"
            type="list-item-two-line@6"
          />

          <v-empty-state
            v-else-if="!activeConversationId"
            icon="mdi-message-text-outline"
            title="Choisissez une conversation"
            text="Sélectionnez une conversation à gauche pour commencer."
          />

          <v-empty-state
            v-else-if="messages.length === 0"
            icon="mdi-chat-processing-outline"
            title="Aucun message"
            text="Soyez le premier à écrire dans cette conversation."
          />

          <div v-else class="d-flex flex-column ga-3">
            <div
              v-for="message in messages"
              :key="message.id"
              class="d-flex"
              :class="isMine(message) ? 'justify-end' : 'justify-start'"
            >
              <v-card
                class="message-bubble"
                :color="isMine(message) ? 'primary' : 'surface-variant'"
                :theme="isMine(message) ? 'dark' : undefined"
                rounded="xl"
                max-width="78%"
              >
                <v-card-text class="py-2 px-3">
                  <p v-if="message.content" class="text-body-2 mb-1">{{ message.content }}</p>

                  <div
                    v-if="message.attachments.length"
                    class="d-flex flex-column ga-2 mb-2"
                  >
                    <a
                      v-for="attachment in message.attachments"
                      :key="attachment.url"
                      :href="attachment.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-decoration-none"
                    >
                      <div v-if="isImageAttachment(attachment)" class="message-image-preview">
                        <img
                          :src="attachment.url"
                          :alt="attachmentLabel(attachment)"
                          loading="lazy"
                        >
                        <div class="message-image-label text-caption">
                          <v-icon size="14" icon="mdi-image-outline" class="me-1" />
                          {{ attachmentLabel(attachment) }}
                        </div>
                      </div>
                      <v-chip
                        v-else
                        size="small"
                        variant="tonal"
                        :prepend-icon="attachmentIcon(attachment)"
                      >
                        {{ attachmentLabel(attachment) }}
                      </v-chip>
                    </a>
                  </div>

                  <div
                    v-if="message.reactions.length"
                    class="d-flex flex-wrap ga-1 mb-2"
                  >
                    <v-chip
                      v-for="reaction in message.reactions"
                      :key="`${reaction.reaction}-${reaction.user?.id ?? 'anonymous'}-${reaction.createdAt ?? ''}`"
                      size="x-small"
                      variant="outlined"
                    >
                      {{ reactionEmoji(reaction.reaction) }}
                      {{ reaction.user?.firstName || reaction.user?.username || '' }}
                    </v-chip>
                  </div>

                  <p class="text-caption mb-1 opacity-70">
                    {{ message.senderName || 'Utilisateur' }} ·
                    {{ toFrenchDate(message.createdAt) }}
                  </p>

                  <div class="d-flex align-center justify-space-between flex-wrap ga-1 mb-1">
                    <v-chip
                      size="x-small"
                      :color="message.isRead ? 'success' : 'warning'"
                      :prepend-icon="message.isRead ? 'mdi-check-all' : 'mdi-email-outline'"
                      variant="tonal"
                    >
                      {{ message.isRead ? 'Lu' : 'Non lu' }}
                    </v-chip>

                    <p
                      v-if="message.readAt"
                      class="text-caption mb-0 opacity-70"
                    >
                      Lu à {{ toFrenchDate(message.readAt) }}
                    </p>
                  </div>

                  <div class="d-flex align-center ga-1 justify-end">
                    <v-menu location="top">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon="mdi-emoticon-happy-outline"
                          size="x-small"
                          variant="text"
                        />
                      </template>
                      <v-list density="compact">
                        <v-list-item
                          v-for="reaction in availableReactions"
                          :key="reaction"
                          @click="reactToMessage(message, reaction)"
                        >
                          <v-list-item-title>{{ reactionEmoji(reaction) }} {{ reaction }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>

                    <v-btn
                      v-if="isMine(message)"
                      icon="mdi-delete-outline"
                      size="x-small"
                      variant="text"
                      color="error"
                      :loading="deletingMessageId === message.id"
                      @click="deleteMessage(message)"
                    />
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </div>

        <v-divider />

        <div class="chat-composer pa-3 d-flex flex-column ga-2">
          <div v-if="selectedFiles.length" class="d-flex flex-wrap ga-2">
            <v-chip
              v-for="(file, index) in selectedFiles"
              :key="`${file.name}-${index}`"
              closable
              prepend-icon="mdi-paperclip"
              @click:close="removeSelectedFile(index)"
            >
              {{ file.name }}
            </v-chip>
          </div>

          <div class="d-flex ga-2 align-end">
            <input
              ref="fileInput"
              type="file"
              multiple
              class="d-none"
              @change="onFileSelection"
            >
            <v-btn
              icon="mdi-paperclip"
              variant="outlined"
              :disabled="!activeConversationId || sending"
              @click="triggerFilePicker"
            />
            <v-textarea
              v-model="draftMessage"
              label="Écrire un message"
              variant="outlined"
              rows="1"
              auto-grow
              hide-details
              class="flex-grow-1"
              :disabled="!activeConversationId || sending"
              @keydown.enter.exact.prevent="sendMessage"
            />
            <v-btn
              color="primary"
              size="large"
              icon="mdi-send"
              :loading="sending"
              :disabled="(!draftMessage.trim() && selectedFiles.length === 0) || !activeConversationId"
              @click="sendMessage"
            />
          </div>
        </div>
      </v-sheet>
    </v-col>
  </v-row>
</template>

<style scoped>
.chat-workspace {
  min-height: calc(100vh - 190px);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.chat-conversations-panel {
  padding-right: 8px;
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.chat-conversations {
  max-height: calc(100vh - 290px);
  overflow-y: auto;
}

.chat-friends-results {
  max-height: 180px;
  overflow-y: auto;
}

.chat-messages {
  overflow-y: auto;
  max-height: calc(100vh - 360px);
  background:
    radial-gradient(circle at 20% 20%, rgba(var(--v-theme-primary), 0.06), transparent 40%),
    radial-gradient(circle at 80% 80%, rgba(var(--v-theme-secondary), 0.06), transparent 40%);
}

.chat-thread {
  background: linear-gradient(180deg, rgba(var(--v-theme-surface), 0.95), rgba(var(--v-theme-surface), 1));
}

.chat-thread-header {
  backdrop-filter: blur(6px);
  background: rgba(var(--v-theme-surface), 0.9);
}

.chat-composer {
  background: rgba(var(--v-theme-surface), 0.96);
}

.message-bubble {
  backdrop-filter: blur(3px);
  box-shadow: 0 8px 22px rgba(5, 8, 15, 0.1);
}

.message-image-preview {
  width: min(220px, 60vw);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.16);
  background: rgba(var(--v-theme-surface), 0.85);
}

.message-image-preview img {
  display: block;
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.message-image-label {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  color: rgba(var(--v-theme-on-surface), 0.76);
}
</style>

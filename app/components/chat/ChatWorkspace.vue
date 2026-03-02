<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import {
  useChatApi,
  type ChatConversation,
  type ChatMessage,
} from '~/composables/api/useChatApi'
import { toUiErrorMessage } from '~/utils/errors/toUiErrorMessage'

const route = useRoute()
const chatApi = useChatApi()
const authStore = useAuthStore()
const { profile } = storeToRefs(authStore)

const loadingConversations = ref(false)
const loadingMessages = ref(false)
const sending = ref(false)

const conversations = ref<ChatConversation[]>([])
const activeConversationId = ref<string>('')
const messages = ref<ChatMessage[]>([])
const draftMessage = ref('')

const hasConversations = computed(() => conversations.value.length > 0)
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

function isMine(message: ChatMessage) {
  const currentUserId = profile.value?.id

  if (currentUserId && message.senderId) {
    return currentUserId === message.senderId
  }

  if (!message.role) return false
  return ['me', 'user', 'candidate', 'owner'].includes(message.role.toLowerCase())
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
      activeConversationId.value = conversations.value[0].id
  } catch (error) {
    Notify.error(toUiErrorMessage(error, 'Impossible de charger les conversations'))
  } finally {
    loadingConversations.value = false
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

    const targetConversation = conversations.value.find(
      (conversation) => conversation.id === conversationId,
    )

    if (targetConversation && detail.title) {
      targetConversation.title = detail.title
    }
  } catch (error) {
    Notify.error(
      toUiErrorMessage(error, 'Impossible de charger les messages'),
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

async function sendMessage() {
  const content = draftMessage.value.trim()
  if (!content || !activeConversationId.value || sending.value) return

  sending.value = true

  try {
    const sent = await chatApi.sendMessage(activeConversationId.value, { content })

    messages.value = [...messages.value, sent]
    draftMessage.value = ''

    const targetConversation = conversations.value.find(
      (conversation) => conversation.id === activeConversationId.value,
    )

    if (targetConversation) {
      targetConversation.lastMessage = content
      targetConversation.updatedAt = new Date().toISOString()
    }
  } catch (error) {
    Notify.error(toUiErrorMessage(error, 'Échec de l’envoi du message'))
  } finally {
    sending.value = false
  }
}

watch(
  activeConversationId,
  async (conversationId) => {
    if (!conversationId) return
    await loadConversationDetail(conversationId)
  },
  { immediate: true },
)

onMounted(loadConversations)
</script>

<template>
  <v-row class="chat-workspace" no-gutters>
    <v-col cols="12" md="4" lg="3" class="border-e">
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
              <v-avatar color="primary" variant="tonal" size="36">
                {{ conversation.title?.slice(0, 1).toUpperCase() || 'C' }}
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-medium text-truncate">
              {{ conversation.title || `Conversation #${conversation.id}` }}
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
                  v-if="conversation.unreadCount"
                  :content="conversation.unreadCount"
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
      <v-sheet class="d-flex flex-column h-100">
        <div class="px-4 py-3 border-b d-flex align-center justify-space-between">
          <div>
            <p class="text-subtitle-1 font-weight-bold mb-0">
              {{ activeConversation?.title || 'Sélectionnez une conversation' }}
            </p>
            <p class="text-caption text-medium-emphasis mb-0">
              {{ messages.length }} message{{ messages.length > 1 ? 's' : '' }}
            </p>
          </div>
          <v-icon icon="mdi-forum-outline" color="primary" />
        </div>

        <div class="chat-messages pa-4 flex-grow-1">
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
                  <p class="text-body-2 mb-1">{{ message.content }}</p>
                  <p class="text-caption mb-0 opacity-70">
                    {{ message.senderName || 'Utilisateur' }} ·
                    {{ toFrenchDate(message.createdAt) }}
                  </p>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </div>

        <v-divider />

        <div class="pa-3 d-flex ga-2 align-end">
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
            :disabled="!draftMessage.trim() || !activeConversationId"
            @click="sendMessage"
          />
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

.chat-conversations {
  max-height: calc(100vh - 290px);
  overflow-y: auto;
}

.chat-messages {
  overflow-y: auto;
  max-height: calc(100vh - 360px);
  background:
    radial-gradient(circle at 20% 20%, rgba(var(--v-theme-primary), 0.06), transparent 40%),
    radial-gradient(circle at 80% 80%, rgba(var(--v-theme-secondary), 0.06), transparent 40%);
}

.message-bubble {
  backdrop-filter: blur(2px);
}
</style>

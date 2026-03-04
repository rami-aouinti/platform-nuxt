<script setup lang="ts">
import type { ChatConversation } from '~/composables/api/useChatApi'

const props = defineProps<{
  isAuthenticated: boolean
  inboxLoading: boolean
  inboxConversations: ChatConversation[]
  openChatAriaLabel: string
}>()

const emit = defineEmits<{
  open: []
}>()

const latestInboxConversations = computed(() =>
  props.inboxConversations.slice(0, 3),
)

function handleMenuOpen(opened: boolean) {
  if (opened) {
    emit('open')
  }
}

function getInboxAvatarLabel(conversation: ChatConversation) {
  const label = (conversation.title ?? '').trim()
  return label.slice(0, 1).toUpperCase() || 'C'
}

function getInboxAvatarUrl(conversation: ChatConversation) {
  const participantWithPhoto = conversation.participants?.find((participant) =>
    Boolean(participant.photo),
  )
  return participantWithPhoto?.photo ?? null
}

function getInboxPreview(conversation: ChatConversation) {
  const preview = conversation.lastMessage?.trim() ?? ''
  return preview.length > 64
    ? `${preview.slice(0, 64)}…`
    : preview || 'Aucun message récent.'
}

function getInboxMeta(conversation: ChatConversation) {
  if (!conversation.updatedAt) return ''

  const parsedDate = new Date(conversation.updatedAt)
  if (Number.isNaN(parsedDate.getTime())) return ''

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate)
}
</script>

<template>
  <v-menu
    v-if="isAuthenticated"
    location="bottom"
    :offset="8"
    @update:model-value="handleMenuOpen"
  >
    <template #activator="{ props: menuProps }">
      <UiButton
        icon
        class="ml-1"
        variant="text"
        :aria-label="openChatAriaLabel"
        v-bind="menuProps"
      >
        <v-icon
          icon="mdi-chat-processing-outline"
          size="26"
          aria-hidden="true"
        />
      </UiButton>
    </template>

    <v-card class="app-bar__notifications-menu" elevation="14" rounded="xl">
      <v-progress-linear
        v-if="inboxLoading"
        indeterminate
        color="primary"
        height="3"
      />

      <v-list
        v-if="latestInboxConversations.length"
        class="py-2"
        bg-color="transparent"
      >
        <v-list-item
          v-for="conversation in latestInboxConversations"
          :key="conversation.id"
          :to="{
            path: '/chat',
            query: { conversationId: conversation.id },
          }"
          class="app-bar__notification-item"
        >
          <template #prepend>
            <v-avatar
              color="primary"
              variant="tonal"
              size="44"
              class="mr-2"
              :image="getInboxAvatarUrl(conversation) ?? undefined"
            >
              <span v-if="!getInboxAvatarUrl(conversation)">
                {{ getInboxAvatarLabel(conversation) }}
              </span>
            </v-avatar>
          </template>

          <v-list-item-title class="app-bar__notification-title">
            {{ conversation.title || `Conversation #${conversation.id}` }}
          </v-list-item-title>

          <v-list-item-subtitle class="app-bar__notification-preview">
            {{ getInboxPreview(conversation) }}
          </v-list-item-subtitle>

          <div class="app-bar__notification-meta">
            <v-icon icon="mdi-clock-time-four-outline" size="14" />
            <span>{{ getInboxMeta(conversation) }}</span>
          </div>

          <template #append>
            <span
              v-if="conversation.unreadCount"
              class="app-bar__notification-dot"
            />
          </template>
        </v-list-item>
      </v-list>

      <div v-else class="text-medium-emphasis text-body-2 px-4 py-6">
        Aucune conversation
      </div>

      <v-divider />
      <v-list bg-color="transparent" class="py-0">
        <v-list-item
          to="/chat"
          class="app-bar__menu-footer-link"
          title="Display All"
        />
      </v-list>
    </v-card>
  </v-menu>
</template>

<style scoped>
.app-bar__notifications-menu {
  width: min(420px, calc(100vw - 24px));
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.2), transparent 60%),
    rgba(21, 21, 27, 0.94);
  backdrop-filter: blur(12px);
}

.app-bar__notification-item {
  margin: 6px 10px;
  border-radius: 16px;
  padding: 8px 10px;
  border: 1px solid transparent;
  transition: background-color 0.18s ease, border-color 0.18s ease;
}

.app-bar__notification-item:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.07);
}

.app-bar__notification-title {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 700;
}

.app-bar__notification-preview {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.app-bar__notification-meta {
  margin-top: 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 0.82rem;
}

.app-bar__notification-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background-color: rgb(var(--v-theme-primary));
  display: inline-block;
}

.app-bar__menu-footer-link {
  text-align: center;
  justify-content: center;
  min-height: 50px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

:deep(.app-bar__menu-footer-link .v-list-item__content) {
  text-align: center;
}
</style>

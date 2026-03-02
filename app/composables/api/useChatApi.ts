export type ChatConversation = {
  id: string
  title?: string | null
  lastMessage?: string | null
  updatedAt?: string | null
  unreadCount?: number | null
}

export type ChatMessage = {
  id: string
  content: string
  createdAt?: string | null
  senderId?: string | null
  senderName?: string | null
  role?: string | null
}

export type ChatConversationDetail = {
  id: string
  title?: string | null
  messages: ChatMessage[]
}

export type ChatSendMessagePayload = {
  content: string
}

type CollectionResponse<T> = T[] | { data?: T[]; items?: T[]; results?: T[] }

const basePath = '/api/v1/me/chat'

function normalizeCollection<T>(payload: CollectionResponse<T>): T[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.results)) return payload.results
  return []
}

function normalizeConversation(raw: Record<string, unknown>): ChatConversation {
  const participants = Array.isArray(raw.participants)
    ? raw.participants.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    : []

  const participantsNames = participants
    .map((participant) => {
      const firstName = typeof participant.firstName === 'string' ? participant.firstName : ''
      const lastName = typeof participant.lastName === 'string' ? participant.lastName : ''
      const username = typeof participant.username === 'string' ? participant.username : ''
      return `${firstName} ${lastName}`.trim() || username
    })
    .filter(Boolean)

  return {
    id: String(raw.id ?? raw.conversationId ?? ''),
    title:
      typeof raw.title === 'string'
        ? raw.title
        : typeof raw.name === 'string'
          ? raw.name
          : participantsNames.join(', ') || 'Conversation',
    lastMessage:
      typeof raw.lastMessage === 'string'
        ? raw.lastMessage
        : typeof raw.last_message === 'string'
          ? raw.last_message
          : null,
    updatedAt:
      typeof raw.updatedAt === 'string'
        ? raw.updatedAt
        : typeof raw.updated_at === 'string'
          ? raw.updated_at
          : null,
    unreadCount:
      typeof raw.unreadCount === 'number'
        ? raw.unreadCount
        : typeof raw.unread_count === 'number'
          ? raw.unread_count
          : null,
  }
}

function normalizeMessage(raw: Record<string, unknown>): ChatMessage {
  return {
    id: String(raw.id ?? raw.messageId ?? crypto.randomUUID()),
    content:
      typeof raw.content === 'string'
        ? raw.content
        : typeof raw.message === 'string'
          ? raw.message
          : '',
    createdAt:
      typeof raw.createdAt === 'string'
        ? raw.createdAt
        : typeof raw.created_at === 'string'
          ? raw.created_at
          : null,
    senderId:
      typeof raw.senderId === 'string'
        ? raw.senderId
        : typeof raw.sender_id === 'string'
          ? raw.sender_id
          : null,
    senderName:
      typeof raw.senderName === 'string'
        ? raw.senderName
        : typeof raw.sender_name === 'string'
          ? raw.sender_name
          : null,
    role:
      typeof raw.role === 'string'
        ? raw.role
        : typeof raw.senderRole === 'string'
          ? raw.senderRole
          : null,
  }
}

function normalizeConversationDetail(payload: Record<string, unknown>): ChatConversationDetail {
  const id = String(payload.id ?? payload.conversationId ?? '')
  const normalizedConversation = normalizeConversation(payload)

  return {
    id,
    title: normalizedConversation.title,
    messages: [],
  }
}

export function useChatApi() {
  return {
    async listConversations(): Promise<ChatConversation[]> {
      const response = await $fetch<CollectionResponse<Record<string, unknown>>>(
        `${basePath}/conversations`,
        { method: 'GET' },
      )

      return normalizeCollection(response)
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
        .map((item) => normalizeConversation(item))
        .filter((conversation) => conversation.id)
    },

    async getConversation(id: string): Promise<ChatConversationDetail> {
      const response = await $fetch<Record<string, unknown>>(
        `${basePath}/conversations/${id}`,
        { method: 'GET' },
      )

      return normalizeConversationDetail(response)
    },

    async sendMessage(id: string, payload: ChatSendMessagePayload): Promise<ChatMessage> {
      const response = await $fetch<Record<string, unknown>>(
        `${basePath}/conversations/${id}/messages`,
        {
          method: 'POST',
          body: payload,
        },
      )

      return normalizeMessage(response)
    },

    async listConversationMessages(id: string): Promise<ChatMessage[]> {
      const response = await $fetch<CollectionResponse<Record<string, unknown>>>(
        `${basePath}/conversations/${id}/messages`,
        { method: 'GET' },
      )

      return normalizeCollection(response)
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
        .map((item) => normalizeMessage(item))
    },
  }
}

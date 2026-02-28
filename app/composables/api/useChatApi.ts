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

const basePath = '/api/v1/chat'

function normalizeCollection<T>(payload: CollectionResponse<T>): T[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.results)) return payload.results
  return []
}

function normalizeConversation(raw: Record<string, unknown>): ChatConversation {
  return {
    id: String(raw.id ?? raw.conversationId ?? ''),
    title: typeof raw.title === 'string' ? raw.title : typeof raw.name === 'string' ? raw.name : 'Conversation',
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
  const title = typeof payload.title === 'string' ? payload.title : null
  const messagesRaw =
    Array.isArray(payload.messages)
      ? payload.messages
      : Array.isArray(payload.data)
        ? payload.data
        : []

  return {
    id,
    title,
    messages: messagesRaw
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((message) => normalizeMessage(message)),
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
  }
}

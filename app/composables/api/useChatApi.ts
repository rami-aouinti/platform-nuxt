export type ChatParticipant = {
  id: string
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  photo?: string | null
}

export type ChatConversation = {
  id: string
  title?: string | null
  lastMessage?: string | null
  updatedAt?: string | null
  unreadCount?: number | null
  participants?: ChatParticipant[]
}

export type ChatMessage = {
  id: string
  content: string
  createdAt?: string | null
  senderId?: string | null
  senderName?: string | null
  senderPhoto?: string | null
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

function normalizeParticipant(raw: Record<string, unknown>): ChatParticipant {
  return {
    id: String(raw.id ?? ''),
    username: typeof raw.username === 'string' ? raw.username : null,
    firstName: typeof raw.firstName === 'string' ? raw.firstName : null,
    lastName: typeof raw.lastName === 'string' ? raw.lastName : null,
    photo: typeof raw.photo === 'string' ? raw.photo : null,
  }
}

function getParticipantDisplayName(participant: ChatParticipant): string {
  const fullName = `${participant.firstName ?? ''} ${participant.lastName ?? ''}`.trim()
  return fullName || participant.username || ''
}

function getLatestConversationMessage(raw: Record<string, unknown>): ChatMessage | null {
  if (!Array.isArray(raw.messages) || raw.messages.length === 0) return null

  const rawMessages = raw.messages
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => normalizeMessage(item))

  if (rawMessages.length === 0) return null

  return rawMessages
    .slice()
    .sort((left, right) => {
      const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0
      const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0
      return rightTime - leftTime
    })[0]
}

function normalizeConversation(raw: Record<string, unknown>): ChatConversation {
  const participants = Array.isArray(raw.participants)
    ? raw.participants
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item) => normalizeParticipant(item))
      .filter((item) => item.id)
    : []

  const participantsNames = participants
    .map((participant) => getParticipantDisplayName(participant))
    .filter(Boolean)

  const latestMessage = getLatestConversationMessage(raw)

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
          : latestMessage?.content ?? null,
    updatedAt:
      typeof raw.updatedAt === 'string'
        ? raw.updatedAt
        : typeof raw.updated_at === 'string'
          ? raw.updated_at
          : latestMessage?.createdAt ?? null,
    unreadCount:
      typeof raw.unreadCount === 'number'
        ? raw.unreadCount
        : typeof raw.unread_count === 'number'
          ? raw.unread_count
          : null,
    participants,
  }
}

function normalizeMessage(raw: Record<string, unknown>): ChatMessage {
  const sender = raw.sender && typeof raw.sender === 'object'
    ? raw.sender as Record<string, unknown>
    : {}

  const senderFirstName = typeof sender.firstName === 'string' ? sender.firstName : ''
  const senderLastName = typeof sender.lastName === 'string' ? sender.lastName : ''
  const senderUsername = typeof sender.username === 'string' ? sender.username : ''

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
          : typeof sender.id === 'string'
            ? sender.id
            : null,
    senderName:
      typeof raw.senderName === 'string'
        ? raw.senderName
        : typeof raw.sender_name === 'string'
          ? raw.sender_name
          : `${senderFirstName} ${senderLastName}`.trim() || senderUsername || null,
    senderPhoto:
      typeof sender.photo === 'string'
        ? sender.photo
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
  const messagesRaw = Array.isArray(payload.messages)
    ? payload.messages
    : Array.isArray(payload.data)
      ? payload.data
      : []

  return {
    id,
    title: normalizedConversation.title,
    messages: messagesRaw
      .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
      .map((item) => normalizeMessage(item)),
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
      const response = await $fetch<CollectionResponse<Record<string, unknown>> | Record<string, unknown>>(
        `${basePath}/conversations/${id}/messages`,
        { method: 'GET' },
      )

      const normalized = Array.isArray(response)
        ? normalizeCollection(response)
        : Array.isArray(response.messages)
          ? response.messages
          : normalizeCollection(response as CollectionResponse<Record<string, unknown>>)

      return normalized
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
        .map((item) => normalizeMessage(item))
    },
  }
}

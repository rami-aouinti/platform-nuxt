export interface Quiz {
  id: string
  title: string
  description?: string | null
  isPublished?: boolean
  createdAt?: string
  updatedAt?: string
  metadata?: Record<string, unknown> | null
}

export interface QuizPayload {
  title: string
  description?: string | null
  isPublished?: boolean
  metadata?: Record<string, unknown>
}

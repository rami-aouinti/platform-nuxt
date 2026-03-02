import type { Id } from '~/composables/api/httpUiErrors'

export type UserProfile = {
  id: Id
  userId?: Id | null
  companyId?: Id | null
  user?: { id: Id; username?: string } | null
  company?: { id: Id; legalName?: string } | null
}

export type CompanyMembership = {
  id: Id
  userId?: Id | null
  companyId?: Id | null
  user?: { id: Id; username?: string } | null
  company?: { id: Id; legalName?: string } | null
}

export type CompanyWritePayload = {
  legalName?: string
  status?: 'active' | 'suspended' | 'inactive'
  ownerId?: Id
}

export type UserProfileWritePayload = {
  userId?: Id
  companyId?: Id
}

export type CompanyMembershipWritePayload = {
  userId?: Id
  companyId?: Id
}

export type BlogPostWritePayload = {
  title?: string
  content?: string
  ownerId?: Id
  companyId?: Id
}

export type BlogCommentWritePayload = {
  content?: string
  ownerId?: Id
  postId?: Id
}

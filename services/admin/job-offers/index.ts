import { createAdminCrudService, type Id, type PatchPayload } from '../_shared'

const JOB_OFFERS_BASE_PATH = '/api/v1/job-offers'

export interface JobOffer {
  id: Id
  title: string
  slug: string
  description: string
  status: 'draft' | 'open' | 'closed'
  company: Id
}

export interface CreateJobOfferRequest {
  title: string
  slug: string
  description: string
  status: JobOffer['status']
  company: Id
}

export interface UpdateJobOfferRequest {
  title?: string
  slug?: string
  description?: string
  status?: JobOffer['status']
  company?: Id
}

export type PatchJobOfferRequest = PatchPayload

export const jobOffersService = createAdminCrudService<
  JobOffer,
  CreateJobOfferRequest,
  UpdateJobOfferRequest,
  PatchJobOfferRequest
>(JOB_OFFERS_BASE_PATH)

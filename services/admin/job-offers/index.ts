import { httpGet } from '../../http/client'
import {
  normalizePaginatedResponse,
  type PaginatedResponse,
} from '../pagination'
import {
  createAdminCrudService,
  normalizeListQuery,
  type Id,
  type ListQuery,
  type PatchPayload,
} from '../_shared'

const JOB_OFFERS_BASE_PATH = '/api/job-offers'

export interface JobOffer {
  id: Id
  title: string
  slug: string
  description: string
  status: 'draft' | 'open' | 'closed'
  company: Id | { id?: Id; name?: string }
  companyName?: string
  location?: string
  city?: string
  region?: string
  employmentType?: string
  workTime?: string
  remoteMode?: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  salaryPeriod?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | string
  publishedAt?: string
  jobCategory?: string
  skills?: string[]
  languages?: string[]
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

export function listMyJobOffers(
  query: ListQuery = {},
): Promise<PaginatedResponse<JobOffer>> {
  return httpGet<
    | PaginatedResponse<JobOffer>
    | JobOffer[]
    | {
        data?: JobOffer[]
        items?: JobOffer[]
        total?: number
        totalItems?: number
      }
  >(`${JOB_OFFERS_BASE_PATH}/my`, { query: normalizeListQuery(query) }).then(
    (response) => normalizePaginatedResponse<JobOffer>(response),
  )
}

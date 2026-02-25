import { httpGet } from '../http/client'
import {
  normalizePaginatedResponse,
  type PaginatedResponse,
} from './pagination'
import { normalizeListQuery, type ListQuery } from './_shared'
import { jobOffersService } from './job-offers/index'
import type { JobOffer } from './job-offers/index'

const JOB_OFFERS_BASE_PATH = '/api/job-offers'

export { jobOffersService }
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

export type {
  CreateJobOfferRequest,
  JobOffer,
  PatchJobOfferRequest,
  UpdateJobOfferRequest,
} from './job-offers/index'

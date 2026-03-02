import { type Id, type PatchPayload, createAdminCrudService } from '../shared/index'
import { httpPatch, httpPost } from '../../http/client'

import { adminEndpoints, withPathParams } from '../endpoints'

const JOB_APPLICATIONS_BASE_PATH = adminEndpoints.jobApplications.base

export interface JobApplication {
  id: Id
  jobOffer: Id
  candidate: Id
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  coverLetter?: string
  cvUrl?: string
  attachments?: string[]
}

export interface CreateJobApplicationRequest {
  jobOffer: Id
  candidate: Id
  coverLetter?: string
  cvUrl?: string
  attachments?: string[]
}

export interface ApplyToJobOfferRequest {
  coverLetter?: string
  cvUrl?: string
  attachments?: string[]
}

export interface UpdateJobApplicationRequest {
  jobOffer?: Id
  candidate?: Id
  status?: JobApplication['status']
  coverLetter?: string
  cvUrl?: string
  attachments?: string[]
}

export type PatchJobApplicationRequest = PatchPayload

const jobApplicationsCrudService = createAdminCrudService<
  JobApplication,
  CreateJobApplicationRequest,
  UpdateJobApplicationRequest,
  PatchJobApplicationRequest
>(JOB_APPLICATIONS_BASE_PATH)

export const jobApplicationsService = {
  ...jobApplicationsCrudService,
  apply(jobOffer: Id, payload: ApplyToJobOfferRequest = {}) {
    return httpPost<JobApplication, ApplyToJobOfferRequest>(withPathParams(adminEndpoints.jobOffers.apply, { id: jobOffer }), payload)
  },
  accept(id: Id) {
    return httpPatch<JobApplication, Record<string, never>>(withPathParams(adminEndpoints.jobApplications.accept, { id }), {})
  },
  reject(id: Id) {
    return httpPatch<JobApplication, Record<string, never>>(withPathParams(adminEndpoints.jobApplications.reject, { id }), {})
  },
  withdraw(id: Id) {
    return httpPatch<JobApplication, Record<string, never>>(withPathParams(adminEndpoints.jobApplications.withdraw, { id }), {})
  },
}

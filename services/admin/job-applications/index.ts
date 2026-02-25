import { type Id, type PatchPayload, createAdminCrudService } from '../_shared'
import { httpPatch, httpPost } from '../../http/client'

const JOB_APPLICATIONS_BASE_PATH = '/api/v1/job-applications'

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
    return httpPost<JobApplication, ApplyToJobOfferRequest>(`/api/v1/job-offers/${jobOffer}/apply`, payload)
  },
  accept(id: Id) {
    return httpPatch<JobApplication, Record<string, never>>(`${JOB_APPLICATIONS_BASE_PATH}/${id}/accept`, {})
  },
  reject(id: Id) {
    return httpPatch<JobApplication, Record<string, never>>(`${JOB_APPLICATIONS_BASE_PATH}/${id}/reject`, {})
  },
  withdraw(id: Id) {
    return httpPatch<JobApplication, Record<string, never>>(`${JOB_APPLICATIONS_BASE_PATH}/${id}/withdraw`, {})
  },
}

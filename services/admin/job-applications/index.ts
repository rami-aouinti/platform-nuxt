import { type Id, type PatchPayload, createAdminCrudService } from '../_shared'
import { httpPatch, httpPost } from '../../http/client'

const JOB_APPLICATIONS_BASE_PATH = '/api/v1/job-applications'

export interface JobApplication {
  id: Id
  offerId: Id
  candidateId: Id
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  coverLetter?: string
}

export interface CreateJobApplicationRequest {
  offerId: Id
  candidateId: Id
  coverLetter?: string
}

export interface UpdateJobApplicationRequest {
  offerId?: Id
  candidateId?: Id
  status?: JobApplication['status']
  coverLetter?: string
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
  apply(offerId: Id) {
    return httpPost<JobApplication, Record<string, never>>(`/api/v1/job-offers/${offerId}/apply`, {})
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

import { describe, expect, it } from 'vitest'
import { apiCanonicalResources, apiEndpoints } from '../../app/services/api/endpoints'
import { API_CANONICAL_ENDPOINT_MAP } from '../../server/utils/api-canonical-map'

describe('api endpoints registry contract', () => {
  it('exposes critical frontend + me/profile endpoints', () => {
    expect(apiEndpoints.frontend.profile.canonical).toBe('/api/v1/me/profile')
    expect(apiEndpoints.frontend.profile.roles).toBe('/api/v1/me/profile/roles')
    expect(apiEndpoints.frontend.profile.groups).toBe('/api/v1/me/profile/groups')

    expect(apiEndpoints.frontend.socialAccounts.base).toBe('/api/v1/me/social-accounts')
    expect(apiEndpoints.frontend.projects.base).toBe('/api/v1/me/profile/projects')
    expect(apiEndpoints.frontend.companies.base).toBe('/api/v1/me/profile/companies')
    expect(apiEndpoints.frontend.companies.schema).toBe('/api/v1/me/profile/companies/schema')
    expect(apiEndpoints.frontend.companies.schemaByMethod()).toBe('/api/v1/me/profile/companies/schema')
    expect(apiEndpoints.frontend.companies.schemaByMethod('post')).toBe('/api/v1/me/profile/companies/schema?method=post')
    expect(apiEndpoints.frontend.companies.companyById('42')).toBe('/api/v1/me/profile/companies/42')

    expect(apiEndpoints.frontend.resumes.base).toBe('/api/v1/me/profile/resumes')
    expect(apiEndpoints.frontend.resumes.resumeById('resume-1')).toBe('/api/v1/me/profile/resumes/resume-1')
    expect(apiEndpoints.frontend.resumes.resumeEducationById('resume-1', 'edu-1')).toBe('/api/v1/me/profile/resumes/resume-1/educations/edu-1')
  })

  it('keeps canonical frontend resources aligned with server canonical map', () => {
    expect(apiCanonicalResources.profile.canonical).toBe(API_CANONICAL_ENDPOINT_MAP.profile.canonical)
    expect(apiCanonicalResources.profile.legacyAliases).toEqual(API_CANONICAL_ENDPOINT_MAP.profile.legacyAliases)

    expect(apiCanonicalResources.profileRoles.canonical).toBe(API_CANONICAL_ENDPOINT_MAP.profileRoles.canonical)
    expect(apiCanonicalResources.profileRoles.legacyAliases).toEqual(API_CANONICAL_ENDPOINT_MAP.profileRoles.legacyAliases)

    expect(apiCanonicalResources.profileGroups.canonical).toBe(API_CANONICAL_ENDPOINT_MAP.profileGroups.canonical)
    expect(apiCanonicalResources.profileGroups.legacyAliases).toEqual(API_CANONICAL_ENDPOINT_MAP.profileGroups.legacyAliases)
  })
})

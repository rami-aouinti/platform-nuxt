export type ApiId = string | number

const FRONTEND_API_BASE = '/api/v1'
const ME_BASE = `${FRONTEND_API_BASE}/me`
const ME_PROFILE_BASE = `${ME_BASE}/profile`

export const apiEndpoints = {
  frontend: {
    tools: {
      base: `${FRONTEND_API_BASE}/tools`,
    },
    localization: {
      base: `${FRONTEND_API_BASE}/localization`,
    },
    catalog: {
      base: `${FRONTEND_API_BASE}/catalog`,
    },
    notifications: {
      base: `${FRONTEND_API_BASE}/notifications`,
      unreadCount: `${FRONTEND_API_BASE}/notifications/unread-count`,
      readAll: `${FRONTEND_API_BASE}/notifications/read-all`,
      byId: (id: ApiId) => `${FRONTEND_API_BASE}/notifications/${id}`,
      markAsReadById: (id: ApiId) => `${FRONTEND_API_BASE}/notifications/${id}/read`,
    },
    chat: {
      base: `${FRONTEND_API_BASE}/chat`,
    },
    profile: {
      canonical: ME_PROFILE_BASE,
      roles: `${ME_PROFILE_BASE}/roles`,
      groups: `${ME_PROFILE_BASE}/groups`,
      avatar: `${ME_PROFILE_BASE}/avatar`,
      addresses: `${ME_PROFILE_BASE}/addresses`,
      addressById: (addressId: ApiId) => `${ME_PROFILE_BASE}/addresses/${addressId}`,
    },
    resumes: {
      base: `${ME_PROFILE_BASE}/resumes`,
      byId: (id: ApiId) => `${ME_PROFILE_BASE}/resumes/${id}`,
      resumeById: (id: ApiId) => `${ME_PROFILE_BASE}/resumes/${id}`,
      experiences: (resumeId: ApiId) => `${ME_PROFILE_BASE}/resumes/${resumeId}/experiences`,
      experienceById: (resumeId: ApiId, id: ApiId) => `${ME_PROFILE_BASE}/resumes/${resumeId}/experiences/${id}`,
      resumeExperienceById: (resumeId: ApiId, id: ApiId) => `${ME_PROFILE_BASE}/resumes/${resumeId}/experiences/${id}`,
      educations: (resumeId: ApiId) => `${ME_PROFILE_BASE}/resumes/${resumeId}/educations`,
      educationById: (resumeId: ApiId, id: ApiId) => `${ME_PROFILE_BASE}/resumes/${resumeId}/educations/${id}`,
      resumeEducationById: (resumeId: ApiId, id: ApiId) => `${ME_PROFILE_BASE}/resumes/${resumeId}/educations/${id}`,
      skills: (resumeId: ApiId) => `${ME_PROFILE_BASE}/resumes/${resumeId}/skills`,
      skillById: (resumeId: ApiId, id: ApiId) => `${ME_PROFILE_BASE}/resumes/${resumeId}/skills/${id}`,
      resumeSkillById: (resumeId: ApiId, id: ApiId) => `${ME_PROFILE_BASE}/resumes/${resumeId}/skills/${id}`,
    },
    companies: {
      base: `${ME_PROFILE_BASE}/companies`,
      schema: `${ME_PROFILE_BASE}/companies/schema`,
      schemaByMethod: (method?: 'post' | 'put' | 'patch') =>
        method ? `${ME_PROFILE_BASE}/companies/schema?method=${method}` : `${ME_PROFILE_BASE}/companies/schema`,
      companyById: (id: ApiId) => `${ME_PROFILE_BASE}/companies/${id}`,
    },
    projects: {
      base: `${ME_PROFILE_BASE}/projects`,
      projectById: (id: ApiId) => `${ME_PROFILE_BASE}/projects/${id}`,
    },
    configurations: {
      base: `${FRONTEND_API_BASE}/configurations`,
    },
    socialAccounts: {
      base: `${ME_BASE}/social-accounts`,
      link: `${ME_BASE}/social-accounts/link`,
      byProvider: (provider: string) => `${ME_BASE}/social-accounts/${provider}`,
    },
  },
} as const

/**
 * Client mirror of server canonical map in `server/utils/api-canonical-map.ts`.
 * Keep these keys aligned to enforce one source of truth client/server.
 */
export const apiCanonicalResources = {
  profile: {
    canonical: apiEndpoints.frontend.profile.canonical,
    legacyAliases: ['/api/v1/profile', '/api/profile'],
  },
  profileRoles: {
    canonical: apiEndpoints.frontend.profile.roles,
    legacyAliases: ['/api/v1/profile/roles', '/api/profile/roles'],
  },
  profileGroups: {
    canonical: apiEndpoints.frontend.profile.groups,
    legacyAliases: ['/api/v1/profile/groups', '/api/profile/groups'],
  },
} as const

export type ApiCanonicalResourceKey = keyof typeof apiCanonicalResources

const profileEndpointCandidates = {
  changePassword: ['/api/v1/me/profile/password', '/api/v1/me/password', '/api/v2/me/password'],
  notifications: ['/api/v1/me/notification-settings', '/api/v2/me/notification-settings'],
  sessions: ['/api/v1/me/sessions', '/api/v2/me/sessions'],
  twoFactor: ['/api/v1/me/two-factor-auth', '/api/v1/me/two-factor', '/api/v2/me/two-factor-auth'],
  deactivateAccount: ['/api/v1/me/account/deactivate', '/api/v1/me/deactivate', '/api/v2/me/account/deactivate'],
  deleteAccount: ['/api/v1/me/account', '/api/v1/me/delete', '/api/v2/me/account'],
} as const

export type ProfileEndpointKey = keyof typeof profileEndpointCandidates

export function getProfileEndpointCandidates(key: ProfileEndpointKey) {
  return profileEndpointCandidates[key]
}

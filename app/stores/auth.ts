import type { AuthGroup, AuthProfile, AuthRole } from '~/types/auth'
import { apiEndpoints } from '~/services/api/endpoints'
import {
  clearPersistedAuthState,
  persistAuthState,
  persistPrimaryRole,
  persistToken,
  readCachedAuthState,
  readPersistedPrimaryRole,
  readPersistedToken,
} from '~/utils/auth/state-cache'
import { canAccessAdmin } from '~/utils/permissions/admin'

const COOKIE_SESSION_TOKEN = '__cookie_session__'

function normalizeBearerToken(rawToken: string | null | undefined) {
  if (!rawToken) {
    return null
  }

  return rawToken.replace(/^Bearer\s+/i, '').trim()
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const profile = ref<AuthProfile | null>(null)
  const groups = ref<AuthGroup[]>([])
  const roles = ref<AuthRole[]>([])
  const primaryRole = ref<AuthRole | null>(null)
  const rolesLoading = ref(false)
  const rolesError = ref<string | null>(null)
  const profileRequest = ref<Promise<void> | null>(null)
  const initialized = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value))
  const hasAdminAccess = computed(() => canAccessAdmin(roles.value))

  function syncPrimaryRole() {
    primaryRole.value = roles.value.length > 0 ? roles.value[0] : null
    persistPrimaryRole(primaryRole.value)
  }

  function persistCurrentAuthState() {
    if (!token.value) {
      clearPersistedAuthState()
      return
    }

    persistAuthState({
      token: token.value,
      profile: profile.value,
      groups: groups.value,
      roles: roles.value,
      cachedAt: Date.now(),
    })
  }

  function hydrateAuthStateFromCache() {
    const cachedState = readCachedAuthState(token.value)

    if (!cachedState) {
      return false
    }

    profile.value = cachedState.profile
    groups.value = cachedState.groups
    roles.value = cachedState.roles
    syncPrimaryRole()

    return true
  }

  function setToken(newToken: string | null) {
    const normalizedToken = normalizeBearerToken(newToken)
    token.value = normalizedToken
    persistToken(normalizedToken)
  }

  function authHeaders() {
    if (!token.value || token.value === COOKIE_SESSION_TOKEN) {
      return undefined
    }

    return {
      Authorization: `Bearer ${token.value}`,
    }
  }

  async function login(username: string, password: string) {
    const response = await $fetch<{ token?: string }>('/api/auth/get_token', {
      method: 'POST',
      body: {
        username,
        password,
      },
    })

    setToken(response?.token ?? COOKIE_SESSION_TOKEN)

    await fetchAuthenticationProfile()
  }

  async function fetchAuthenticationProfile() {
    if (!token.value) {
      return
    }

    const headers = authHeaders()
    const [profileResponse, groupsResponse, rolesResponse] = await Promise.allSettled([
      $fetch<AuthProfile>(apiEndpoints.frontend.profile.canonical, { headers }),
      $fetch<AuthGroup[]>(apiEndpoints.frontend.profile.groups, { headers }),
      $fetch<AuthRole[]>(apiEndpoints.frontend.profile.roles, { headers }),
    ])

    if (profileResponse.status !== 'fulfilled') {
      throw profileResponse.reason
    }

    profile.value = profileResponse.value

    if (groupsResponse.status === 'fulfilled') {
      groups.value = groupsResponse.value
    }

    if (rolesResponse.status === 'fulfilled') {
      roles.value = rolesResponse.value
    }

    syncPrimaryRole()
    persistCurrentAuthState()
  }

  async function fetchProfileData() {
    if (!token.value) {
      return
    }

    if (profileRequest.value) {
      return await profileRequest.value
    }

    const headers = authHeaders()

    rolesLoading.value = true
    rolesError.value = null

    profileRequest.value = (async () => {
      try {
        const profileResponse = await $fetch<AuthProfile>(
          apiEndpoints.frontend.profile.canonical,
          { headers },
        )

        const [groupsResponse, rolesResponse] = await Promise.allSettled([
          $fetch<AuthGroup[]>(apiEndpoints.frontend.profile.groups, { headers }),
          $fetch<AuthRole[]>(apiEndpoints.frontend.profile.roles, { headers }),
        ])

        profile.value = profileResponse

        if (groupsResponse.status === 'fulfilled') {
          groups.value = groupsResponse.value
        }

        if (rolesResponse.status === 'fulfilled') {
          roles.value = rolesResponse.value
        }

        syncPrimaryRole()
        persistCurrentAuthState()
      } catch (error) {
        rolesError.value = 'Impossible de charger le profil utilisateur.'
        throw error
      } finally {
        rolesLoading.value = false
        profileRequest.value = null
      }
    })()

    return await profileRequest.value
  }

  async function ensureRolesLoaded(force = false) {
    if (!isAuthenticated.value) {
      roles.value = []
      syncPrimaryRole()
      return roles.value
    }

    if (!force && roles.value.length > 0) {
      return roles.value
    }

    rolesLoading.value = true
    rolesError.value = null

    try {
      const rolesResponse = await $fetch<AuthRole[]>(apiEndpoints.frontend.profile.roles, {
        headers: authHeaders(),
      })
      roles.value = rolesResponse
      syncPrimaryRole()
      persistCurrentAuthState()
      return roles.value
    } catch (error) {
      rolesError.value = 'Impossible de charger les rôles utilisateur.'
      throw error
    } finally {
      rolesLoading.value = false
    }
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // no-op: logout local reste prioritaire même si l'API échoue
    }

    setToken(null)
    profile.value = null
    groups.value = []
    roles.value = []
    primaryRole.value = null
    persistPrimaryRole(null)
    rolesError.value = null
    rolesLoading.value = false
    profileRequest.value = null
    clearPersistedAuthState()
  }

  async function initAuth() {
    initialized.value = false

    const storedToken = readPersistedToken()

    if (!storedToken) {
      setToken(null)
      initialized.value = true

      return
    }

    setToken(storedToken)

    const storedPrimaryRole = readPersistedPrimaryRole()
    if (storedPrimaryRole) {
      primaryRole.value = storedPrimaryRole

      if (roles.value.length === 0) {
        roles.value = [storedPrimaryRole]
      }
    }

    if (hydrateAuthStateFromCache()) {
      initialized.value = true
      return
    }

    try {
      await fetchAuthenticationProfile()
    } catch {
      await logout()
    } finally {
      initialized.value = true
    }
  }

  return {
    token,
    profile,
    groups,
    roles,
    primaryRole,
    rolesLoading,
    rolesError,
    initialized,
    isAuthenticated,
    hasAdminAccess,
    login,
    fetchAuthenticationProfile,
    fetchProfileData,
    ensureRolesLoaded,
    logout,
    initAuth,
  }
})

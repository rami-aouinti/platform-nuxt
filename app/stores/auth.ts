import type { AuthGroup, AuthProfile, AuthRole } from '~/types/auth'
import {
  clearPersistedAuthState,
  persistAuthState,
  persistToken,
  readCachedAuthState,
  readPersistedToken,
} from '~/utils/auth/state-cache'
import { canAccessAdmin } from '~/utils/permissions/admin'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const profile = ref<AuthProfile | null>(null)
  const groups = ref<AuthGroup[]>([])
  const roles = ref<AuthRole[]>([])
  const rolesLoading = ref(false)
  const rolesError = ref<string | null>(null)
  const profileRequest = ref<Promise<void> | null>(null)

  const isAuthenticated = computed(() => Boolean(token.value))
  const hasAdminAccess = computed(() => canAccessAdmin(roles.value))

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

    return true
  }

  function setToken(newToken: string | null) {
    token.value = newToken
    persistToken(newToken)
  }

  function authHeaders() {
    if (!token.value) {
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

    setToken(response?.token ?? null)

    if (!token.value) {
      throw new Error('Token absent de la réponse API.')
    }
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
        const [profileResponse, groupsResponse, rolesResponse] = await Promise.all([
          $fetch<AuthProfile>('/api/profile', { headers }),
          $fetch<AuthGroup[]>('/api/profile/groups', { headers }),
          $fetch<AuthRole[]>('/api/profile/roles', { headers }),
        ])

        profile.value = profileResponse
        groups.value = groupsResponse
        roles.value = rolesResponse
        persistCurrentAuthState()
      } catch (error) {
        rolesError.value = 'Impossible de charger les rôles utilisateur.'
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
      return roles.value
    }

    if (!force && roles.value.length > 0) {
      return roles.value
    }

    rolesLoading.value = true
    rolesError.value = null

    try {
      const rolesResponse = await $fetch<AuthRole[]>('/api/profile/roles', {
        headers: authHeaders(),
      })
      roles.value = rolesResponse
      persistCurrentAuthState()
      return roles.value
    } catch (error) {
      rolesError.value = 'Impossible de charger les rôles utilisateur.'
      throw error
    } finally {
      rolesLoading.value = false
    }
  }

  function logout() {
    setToken(null)
    profile.value = null
    groups.value = []
    roles.value = []
    rolesError.value = null
    rolesLoading.value = false
    profileRequest.value = null
    clearPersistedAuthState()
  }

  async function initAuth() {
    if (!import.meta.client) {
      return
    }

    const storedToken = readPersistedToken()

    if (!storedToken) {
      logout()
      return
    }

    setToken(storedToken)

    if (hydrateAuthStateFromCache()) {
      return
    }

    try {
      await fetchProfileData()
    } catch {
      logout()
    }
  }

  return {
    token,
    profile,
    groups,
    roles,
    rolesLoading,
    rolesError,
    isAuthenticated,
    hasAdminAccess,
    login,
    fetchProfileData,
    ensureRolesLoaded,
    logout,
    initAuth,
  }
})

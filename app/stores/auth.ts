import type { AuthGroup, AuthProfile, AuthRole } from '~/types/auth'
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

    await fetchProfileData()
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
        const [profileResponse, groupsResponse, rolesResponse] =
          await Promise.all([
            $fetch<AuthProfile>('/api/profile', { headers }),
            $fetch<AuthGroup[]>('/api/profile/groups', { headers }),
            $fetch<AuthRole[]>('/api/profile/roles', { headers }),
          ])

        profile.value = profileResponse
        groups.value = groupsResponse
        roles.value = rolesResponse
        syncPrimaryRole()
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
      syncPrimaryRole()
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

  function logout() {
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
      logout()
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
      await fetchProfileData()
    } catch {
      logout()
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
    fetchProfileData,
    ensureRolesLoaded,
    logout,
    initAuth,
  }
})

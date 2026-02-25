import { canAccessAdmin } from '~/utils/permissions/admin'

type AuthProfile = {
  id: string | number
  username: string
  firstName: string
  lastName: string
  email: string
  [key: string]: unknown
}

type AuthGroup = {
  id: string | number
  role: {
    id: string
  }
  name: string
}

const AUTH_TOKEN_STORAGE_KEY = 'auth_token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const profile = ref<AuthProfile | null>(null)
  const groups = ref<AuthGroup[]>([])
  const roles = ref<string[]>([])
  const rolesLoading = ref(false)
  const rolesError = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(token.value))
  const hasAdminAccess = computed(() => canAccessAdmin(roles.value))

  function persistToken() {
    if (!import.meta.client) {
      return
    }

    if (token.value) {
      sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token.value)
      return
    }

    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  }

  function setToken(newToken: string | null) {
    token.value = newToken
    persistToken()
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

    const headers = authHeaders()

    rolesLoading.value = true
    rolesError.value = null

    try {
      const [profileResponse, groupsResponse, rolesResponse] = await Promise.all([
        $fetch<AuthProfile>('/api/profile', { headers }),
        $fetch<AuthGroup[]>('/api/profile/groups', { headers }),
        $fetch<string[]>('/api/profile/roles', { headers }),
      ])

      profile.value = profileResponse
      groups.value = groupsResponse
      roles.value = rolesResponse
    } catch (error) {
      rolesError.value = 'Impossible de charger les rôles utilisateur.'
      throw error
    } finally {
      rolesLoading.value = false
    }
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
      const rolesResponse = await $fetch<string[]>('/api/profile/roles', {
        headers: authHeaders(),
      })
      roles.value = rolesResponse
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
  }

  async function initAuth() {
    if (!import.meta.client) {
      return
    }

    const storedToken = sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

    if (!storedToken) {
      logout()
      return
    }

    setToken(storedToken)

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

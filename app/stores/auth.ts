export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const isConnected = computed(() => Boolean(token.value))
  const errorMessage = ref('')
  const loading = ref(false)

  function setToken(newToken: string) {
    token.value = newToken

    if (!import.meta.client) {
      return
    }

    if (newToken) {
      localStorage.setItem('auth_token', newToken)
      return
    }

    localStorage.removeItem('auth_token')
  }

  function initializeFromStorage() {
    if (!import.meta.client || token.value) {
      return
    }

    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      token.value = storedToken
    }
  }

  async function login(username: string, password: string) {
    if (loading.value) {
      return false
    }

    loading.value = true
    errorMessage.value = ''

    try {
      const response = await $fetch<{ token?: string }>('/api/auth/get_token', {
        method: 'POST',
        body: {
          username,
          password,
        },
      })

      if (!response?.token) {
        errorMessage.value = 'Connexion échouée : token absent de la réponse API.'
        setToken('')
        return false
      }

      setToken(response.token)
      return true
    }
    catch (error) {
      const message = error instanceof Error ? error.message : ''
      errorMessage.value = message
        ? `Connexion échouée : ${message}`
        : 'Connexion échouée : identifiants invalides ou API inaccessible.'
      setToken('')
      return false
    }
    finally {
      loading.value = false
    }
  }

  function logout() {
    setToken('')
    errorMessage.value = ''
  }

  return {
    token,
    isConnected,
    errorMessage,
    loading,
    initializeFromStorage,
    login,
    logout,
  }
})

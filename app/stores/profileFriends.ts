import type { FriendRequest, FriendUser } from '~/composables/api/useFriendsApi'
import { useFriendsApi } from '~/composables/api/useFriendsApi'
import { toUiErrorMessage } from './_entity'
import { Notify } from './notification'

type PaginationState = {
  page: number
  perPage: number
  total: number
}

type SortState = {
  field: string
  direction: 'asc' | 'desc'
}

export const useProfileFriendsStore = defineStore('profileFriends', () => {
  const t = (key: string, params?: Record<string, unknown>) => String(useNuxtApp().$i18n.t(key, params))
  const api = useFriendsApi()

  const rows = ref<FriendUser[]>([])
  const item = ref<FriendUser | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<PaginationState>({ page: 1, perPage: 10, total: 0 })
  const sort = ref<SortState | null>(null)
  const search = ref('')

  const sentRequests = ref<FriendRequest[]>([])
  const receivedRequests = ref<FriendRequest[]>([])
  const actionLoading = ref(false)

  async function fetchRows(fetchOptions: { silent?: boolean } = {}) {
    if (!fetchOptions.silent) loading.value = true
    error.value = null

    try {
      const [friendsResult, sentResult, receivedResult] = await Promise.all([
        api.listFriends(),
        api.listSentRequests(),
        api.listReceivedRequests(),
      ])

      rows.value = friendsResult
      sentRequests.value = sentResult
      receivedRequests.value = receivedResult
      pagination.value.total = friendsResult.length

      return rows.value
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      if (!fetchOptions.silent) loading.value = false
    }
  }

  async function fetchItem(id: string) {
    const friend = rows.value.find(entry => entry.id === id) ?? null
    item.value = friend
    return friend
  }

  async function create(payload: { userId: string }) {
    if (!payload.userId.trim()) {
      error.value = t('profile.friends.errors.userIdRequired')
      Notify.error(error.value)
      throw new Error(error.value)
    }

    actionLoading.value = true
    error.value = null

    try {
      const created = await api.sendFriendRequest(payload.userId)
      Notify.success(t('profile.friends.actions.requestSent'))
      await fetchRows({ silent: true })
      return created
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      actionLoading.value = false
    }
  }

  async function update(id: string) {
    actionLoading.value = true
    error.value = null

    try {
      const updated = await api.acceptFriendRequest(id)
      Notify.success(t('profile.friends.actions.requestAccepted'))
      await fetchRows({ silent: true })
      return updated
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      actionLoading.value = false
    }
  }

  async function patch(id: string) {
    return update(id)
  }

  async function remove(id: string) {
    actionLoading.value = true
    error.value = null

    try {
      await api.deleteFriend(id)
      Notify.success(t('profile.friends.actions.friendRemoved'))
      await fetchRows({ silent: true })
    } catch (errorValue) {
      error.value = toUiErrorMessage(errorValue)
      Notify.error(error.value)
      throw errorValue
    } finally {
      actionLoading.value = false
    }
  }

  function setPage(page: number) { pagination.value.page = page }
  function setPerPage(perPage: number) { pagination.value.perPage = perPage; pagination.value.page = 1 }
  function setSort(field: string, direction: 'asc' | 'desc') { sort.value = { field, direction } }
  function setSearch(value: string) { search.value = value; pagination.value.page = 1 }

  return {
    rows,
    item,
    loading,
    error,
    pagination,
    sort,
    search,
    sentRequests,
    receivedRequests,
    actionLoading,
    fetchRows,
    fetchItem,
    create,
    update,
    patch,
    remove,
    setPage,
    setPerPage,
    setSort,
    setSearch,
  }
})

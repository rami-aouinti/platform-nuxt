import type {
  CreateProfileCompanyPayload,
  PatchProfileCompanyPayload,
  ProfileCompany,
  ProfileCompanySchema,
  ProfileCompanySchemaMethod,
  UpdateProfileCompanyPayload,
} from '~/composables/useProfileCompaniesApi'
import { useProfileCompaniesApi } from '~/composables/useProfileCompaniesApi'
import { Notify } from '~/stores/notification'

const fallbackSchema: ProfileCompanySchema = {
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      title: 'Nom de la société',
      description: 'Nom de la société',
    },
    role: {
      type: 'string',
      title: 'Rôle',
      description: 'Votre rôle dans cette société',
    },
    description: {
      type: 'string',
      title: 'Description',
      description: 'Description courte',
    },
  },
}

export const useProfileCompaniesStore = defineStore('profileCompanies', () => {
  const t = (key: string, params?: Record<string, unknown>) => String(useNuxtApp().$i18n.t(key, params))

  const api = useProfileCompaniesApi()

  const list = ref<ProfileCompany[]>([])
  const current = ref<ProfileCompany | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const schema = ref<ProfileCompanySchema | null>(null)
  const schemaLoading = ref(false)
  const schemaError = ref<string | null>(null)
  const usesSchemaFallback = ref(false)

  function setErrorMessage(message: string | null) {
    error.value = message
  }

  async function fetchList() {
    loading.value = true
    setErrorMessage(null)

    try {
      const response = await api.list()
      list.value = response.data
      return list.value
    } catch (errorValue) {
      setErrorMessage(t('notifications.profileCompanies.loadListError'))
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: string) {
    loading.value = true
    setErrorMessage(null)

    try {
      const company = await api.get(id)
      current.value = company
      const exists = list.value.some(item => item.id === id)
      if (!exists) {
        list.value = [company, ...list.value]
      }
      return company
    } catch (errorValue) {
      setErrorMessage(t('notifications.profileCompanies.loadItemError'))
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function create(payload: CreateProfileCompanyPayload) {
    loading.value = true
    setErrorMessage(null)

    try {
      const created = await api.create(payload)
      list.value = [created, ...list.value]
      current.value = created
      Notify.success(t('notifications.profileCompanies.created'))
      return created
    } catch (errorValue) {
      setErrorMessage(t('notifications.profileCompanies.createError'))
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function update(id: string, payload: UpdateProfileCompanyPayload) {
    loading.value = true
    setErrorMessage(null)

    try {
      const updated = await api.update(id, payload)
      list.value = list.value.map(item => item.id === id ? updated : item)
      current.value = updated
      Notify.success(t('notifications.profileCompanies.updated'))
      return updated
    } catch (errorValue) {
      setErrorMessage(t('notifications.profileCompanies.updateError'))
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function patch(id: string, payload: PatchProfileCompanyPayload) {
    loading.value = true
    setErrorMessage(null)

    try {
      const updated = await api.patch(id, payload)
      list.value = list.value.map(item => item.id === id ? updated : item)
      current.value = updated
      Notify.success(t('notifications.profileCompanies.updated'))
      return updated
    } catch (errorValue) {
      setErrorMessage(t('notifications.profileCompanies.patchError'))
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function remove(id: string) {
    loading.value = true
    setErrorMessage(null)

    try {
      await api.delete(id)
      list.value = list.value.filter(item => item.id !== id)
      if (current.value?.id === id) {
        current.value = null
      }
      Notify.success(t('notifications.profileCompanies.deleted'))
    } catch (errorValue) {
      setErrorMessage(t('notifications.profileCompanies.deleteError'))
      Notify.error(error.value)
      throw errorValue
    } finally {
      loading.value = false
    }
  }

  async function fetchSchema(method: ProfileCompanySchemaMethod) {
    schemaLoading.value = true
    schemaError.value = null

    try {
      schema.value = await api.getSchema(method)
      usesSchemaFallback.value = false
      return schema.value
    } catch {
      schemaError.value = t('notifications.profileCompanies.schemaFallback')
      schema.value = fallbackSchema
      usesSchemaFallback.value = true
      return schema.value
    } finally {
      schemaLoading.value = false
    }
  }

  return {
    list,
    current,
    loading,
    error,
    schema,
    schemaLoading,
    schemaError,
    usesSchemaFallback,
    fetchList,
    fetchOne,
    create,
    update,
    patch,
    remove,
    fetchSchema,
  }
})

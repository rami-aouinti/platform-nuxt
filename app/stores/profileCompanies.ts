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
      setErrorMessage('Impossible de charger les sociétés du profil.')
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
      setErrorMessage('Impossible de charger la société demandée.')
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
      Notify.success('Société créée avec succès.')
      return created
    } catch (errorValue) {
      setErrorMessage('La création de la société a échoué.')
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
      Notify.success('Société mise à jour.')
      return updated
    } catch (errorValue) {
      setErrorMessage('La mise à jour de la société a échoué.')
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
      Notify.success('Société mise à jour.')
      return updated
    } catch (errorValue) {
      setErrorMessage('La mise à jour partielle de la société a échoué.')
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
      Notify.success('Société supprimée.')
    } catch (errorValue) {
      setErrorMessage('La suppression de la société a échoué.')
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
      schemaError.value = 'Schéma indisponible: utilisation du formulaire minimal.'
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

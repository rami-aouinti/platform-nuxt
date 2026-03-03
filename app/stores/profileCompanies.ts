import type {
  CreateProfileCompanyPayload,
  PatchProfileCompanyPayload,
  ProfileCompany,
  ProfileCompanySchema,
  ProfileCompanySchemaMethod,
  UpdateProfileCompanyPayload,
} from '~/composables/useProfileCompaniesApi'
import { useProfileCompaniesApi } from '~/composables/useProfileCompaniesApi'
import { resolvePaginatedTotal } from '~/composables/api/httpUiErrors'
import { createCrudEntityStore } from '~/stores/_factories/createCrudEntityStore'
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

  const crudStore = createCrudEntityStore<ProfileCompany, CreateProfileCompanyPayload, UpdateProfileCompanyPayload, PatchProfileCompanyPayload>({
    fetchRows: async (query) => {
      const response = await api.list(query)
      return {
        data: response.data,
        total: resolvePaginatedTotal(response.meta?.total, response.data.length),
      }
    },
    fetchItem: (id) => api.get(id),
    create: (payload) => api.create(payload),
    update: (id, payload) => api.update(id, payload),
    patch: (id, payload) => api.patch(id, payload),
    remove: async (id) => { await api.delete(id) },
    applyUpdate: (entity, payload) => ({ ...entity, ...payload }),
    applyPatch: (entity, payload) => ({ ...entity, ...payload }),
    notifications: {
      success: {
        create: t('notifications.profileCompanies.created'),
        update: t('notifications.profileCompanies.updated'),
        patch: t('notifications.profileCompanies.updated'),
        remove: t('notifications.profileCompanies.deleted'),
      },
      error: {
        fetchRows: t('notifications.profileCompanies.loadListError'),
        fetchItem: t('notifications.profileCompanies.loadItemError'),
        create: t('notifications.profileCompanies.createError'),
        update: t('notifications.profileCompanies.updateError'),
        patch: t('notifications.profileCompanies.patchError'),
        remove: t('notifications.profileCompanies.deleteError'),
      },
      notifySuccess: (message) => Notify.success(message),
      notifyError: (message) => Notify.error(message),
    },
  })

  const schema = ref<ProfileCompanySchema | null>(null)
  const schemaLoading = ref(false)
  const schemaError = ref<string | null>(null)
  const usesSchemaFallback = ref(false)

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
    ...crudStore,
    list: crudStore.rows,
    current: crudStore.item,
    fetchList: crudStore.fetchRows,
    fetchOne: crudStore.fetchItem,
    schema,
    schemaLoading,
    schemaError,
    usesSchemaFallback,
    fetchSchema,
  }
})

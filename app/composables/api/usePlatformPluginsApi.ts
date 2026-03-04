import { apiRequest, normalizePaginatedResponse, type ApiListResponse } from './httpUiErrors'

export type PlatformPlugin = {
  id: string
  keyName: string
  name: string
  logo: string | null
  description: string | null
  active: boolean
  enabled: boolean | null
}

type PluginsResponse = {
  items?: PlatformPlugin[]
  data?: PlatformPlugin[]
}

function normalizePlugin(entry: Partial<PlatformPlugin>): PlatformPlugin {
  return {
    id: String(entry.id ?? ''),
    keyName: String(entry.keyName ?? ''),
    name: String(entry.name ?? 'Plugin'),
    logo: typeof entry.logo === 'string' ? entry.logo : null,
    description: typeof entry.description === 'string' ? entry.description : null,
    active: Boolean(entry.active),
    enabled:
      entry.enabled === null || entry.enabled === undefined
        ? null
        : Boolean(entry.enabled),
  }
}

export function usePlatformPluginsApi() {
  return {
    listAll: async () => {
      const payload = await apiRequest<ApiListResponse<PlatformPlugin> | PluginsResponse>(
        'GET',
        '/api/v1/plugins',
      )

      return normalizePaginatedResponse(payload as ApiListResponse<PlatformPlugin>).data.map(
        normalizePlugin,
      )
    },
    listByUserApplication: async (userApplicationId: string) => {
      const payload = await apiRequest<ApiListResponse<PlatformPlugin> | PluginsResponse>(
        'GET',
        `/api/v1/profile/user-applications/${userApplicationId}/plugins`,
      )

      return normalizePaginatedResponse(payload as ApiListResponse<PlatformPlugin>).data.map(
        normalizePlugin,
      )
    },
    attach: async (userApplicationId: string, pluginId: string) =>
      normalizePlugin(
        await apiRequest<PlatformPlugin>(
          'POST',
          `/api/v1/profile/user-applications/${userApplicationId}/plugins/${pluginId}/attach`,
        ),
      ),
    detach: async (userApplicationId: string, pluginId: string) => {
      await apiRequest<unknown>(
        'DELETE',
        `/api/v1/profile/user-applications/${userApplicationId}/plugins/${pluginId}/detach`,
      )
    },
  }
}

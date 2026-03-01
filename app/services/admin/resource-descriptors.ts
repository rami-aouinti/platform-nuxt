import type { AdminResourceDescriptor } from '~/types/admin-resource'

export const adminResourceDescriptors = {
  users: {
    schemaEndpoint: '/api/v1/admin/users/schema',
    list: {
      endpoint: '/api/v1/admin/users',
      countEndpoint: '/api/v1/admin/users/count',
    },
    show: ({ id }) => `/api/v1/admin/users/${encodeURIComponent(String(id ?? ''))}`,
    create: '/api/v1/admin/users',
    patch: ({ id }) => `/api/v1/admin/users/${encodeURIComponent(String(id ?? ''))}`,
    delete: ({ id }) => `/api/v1/admin/users/${encodeURIComponent(String(id ?? ''))}`,
    relationActions: {
      groups: {
        list: ({ id }) => `/api/v1/admin/users/${encodeURIComponent(String(id ?? ''))}/groups`,
      },
      roles: {
        list: ({ id }) => `/api/v1/admin/users/${encodeURIComponent(String(id ?? ''))}/roles`,
      },
    },
    permissions: {
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canShow: true,
      canPatch: true,
    },
  },
  roles: {
    schemaEndpoint: '/api/v1/admin/role/schema',
    list: {
      endpoint: '/api/v1/admin/role',
      countEndpoint: '/api/v1/admin/role/count',
    },
    show: ({ id }) => `/api/v1/admin/role/${encodeURIComponent(String(id ?? ''))}`,
    create: '/api/v1/admin/role',
    patch: ({ id }) => `/api/v1/admin/role/${encodeURIComponent(String(id ?? ''))}`,
    delete: ({ id }) => `/api/v1/admin/role/${encodeURIComponent(String(id ?? ''))}`,
    permissions: {
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canShow: true,
      canPatch: false,
    },
  },
  groups: {
    schemaEndpoint: '/api/v1/admin/user_group/schema',
    list: {
      endpoint: '/api/v1/admin/user_group',
      countEndpoint: '/api/v1/admin/user_group/count',
    },
    show: ({ id }) => `/api/v1/admin/user_group/${encodeURIComponent(String(id ?? ''))}`,
    create: '/api/v1/admin/user_group',
    patch: ({ id }) => `/api/v1/admin/user_group/${encodeURIComponent(String(id ?? ''))}`,
    delete: ({ id }) => `/api/v1/admin/user_group/${encodeURIComponent(String(id ?? ''))}`,
    relationActions: {
      users: {
        list: ({ id }) => `/api/v1/admin/user_group/${encodeURIComponent(String(id ?? ''))}/users`,
      },
    },
    permissions: {
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canShow: true,
      canPatch: false,
    },
  },
  apiKeys: {
    schemaEndpoint: '/api/api_key/schema',
    list: '/api/admin/api-keys',
    permissions: {
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canShow: true,
      canPatch: true,
    },
  },
} satisfies Record<string, AdminResourceDescriptor>

export function getAdminResourceDescriptor(resource: keyof typeof adminResourceDescriptors): AdminResourceDescriptor {
  return adminResourceDescriptors[resource]
}

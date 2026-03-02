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
    schemaEndpoint: '/api/v1/admin/roles/schema',
    list: {
      endpoint: '/api/v1/admin/roles',
      countEndpoint: '/api/v1/admin/roles/count',
    },
    show: ({ id }) => `/api/v1/admin/roles/${encodeURIComponent(String(id ?? ''))}`,
    create: '/api/v1/admin/roles',
    patch: ({ id }) => `/api/v1/admin/roles/${encodeURIComponent(String(id ?? ''))}`,
    delete: ({ id }) => `/api/v1/admin/roles/${encodeURIComponent(String(id ?? ''))}`,
    permissions: {
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canShow: true,
      canPatch: false,
    },
  },
  groups: {
    schemaEndpoint: '/api/v1/admin/user-groups/schema',
    list: {
      endpoint: '/api/v1/admin/user-groups',
      countEndpoint: '/api/v1/admin/user-groups/count',
    },
    show: ({ id }) => `/api/v1/admin/user-groups/${encodeURIComponent(String(id ?? ''))}`,
    create: '/api/v1/admin/user-groups',
    patch: ({ id }) => `/api/v1/admin/user-groups/${encodeURIComponent(String(id ?? ''))}`,
    delete: ({ id }) => `/api/v1/admin/user-groups/${encodeURIComponent(String(id ?? ''))}`,
    relationActions: {
      users: {
        list: ({ id }) => `/api/v1/admin/user-groups/${encodeURIComponent(String(id ?? ''))}/users`,
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
    schemaEndpoint: '/api/v1/admin/api-keys/schema',
    list: '/api/v1/admin/api-keys',
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

import type { AdminResourceDescriptor } from '~/types/admin-resource'

export const adminResourceDescriptors = {
  users: {
    schemaEndpoint: '/api/user/schema',
    list: {
      endpoint: '/api/user',
      countEndpoint: '/api/user/count',
    },
    show: ({ id }) => `/api/user/${encodeURIComponent(String(id ?? ''))}`,
    create: '/api/user',
    patch: ({ id }) => `/api/user/${encodeURIComponent(String(id ?? ''))}`,
    delete: ({ id }) => `/api/user/${encodeURIComponent(String(id ?? ''))}`,
    relationActions: {
      groups: {
        list: ({ id }) => `/api/user/${encodeURIComponent(String(id ?? ''))}/groups`,
      },
      roles: {
        list: ({ id }) => `/api/user/${encodeURIComponent(String(id ?? ''))}/roles`,
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
    list: {
      endpoint: '/api/role',
      countEndpoint: '/api/role/count',
    },
    show: ({ id }) => `/api/role/${encodeURIComponent(String(id ?? ''))}`,
    create: '/api/role',
    patch: ({ id }) => `/api/role/${encodeURIComponent(String(id ?? ''))}`,
    delete: ({ id }) => `/api/role/${encodeURIComponent(String(id ?? ''))}`,
    permissions: {
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canShow: true,
      canPatch: false,
    },
  },
  groups: {
    list: {
      endpoint: '/api/user_group',
      countEndpoint: '/api/user_group/count',
    },
    show: ({ id }) => `/api/user_group/${encodeURIComponent(String(id ?? ''))}`,
    create: '/api/user_group',
    patch: ({ id }) => `/api/user_group/${encodeURIComponent(String(id ?? ''))}`,
    delete: ({ id }) => `/api/user_group/${encodeURIComponent(String(id ?? ''))}`,
    relationActions: {
      users: {
        list: ({ id }) => `/api/user_group/${encodeURIComponent(String(id ?? ''))}/users`,
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
} satisfies Record<string, AdminResourceDescriptor>

export function getAdminResourceDescriptor(resource: keyof typeof adminResourceDescriptors): AdminResourceDescriptor {
  return adminResourceDescriptors[resource]
}

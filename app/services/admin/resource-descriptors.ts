import type { AdminResourceDescriptor } from '~/types/admin-resource'
import type { EntityDefinition } from '~/types/entities'

function defaultUserFields() {
  return [
    { key: 'username', label: 'Username', type: 'string' as const },
    { key: 'firstName', label: 'First name', type: 'string' as const },
    { key: 'lastName', label: 'Last name', type: 'string' as const },
    { key: 'email', label: 'Email', type: 'string' as const },
  ]
}

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
    show: ({ id }) => `/api/v1/role/${encodeURIComponent(String(id ?? ''))}`,
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
        list: ({ id }) => `/api/v1/user_group/${encodeURIComponent(String(id ?? ''))}/users`,
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
  apiKeys: {
    schemaEndpoint: '/api/v2/api_key/schema',
    list: {
      endpoint: '/api/v2/api_key',
      countEndpoint: '/api/v2/api_key/count',
    },
    show: ({ id }) => `/api/v2/api_key/${encodeURIComponent(String(id ?? ''))}`,
    create: '/api/v2/api_key',
    patch: ({ id }) => `/api/v2/api_key/${encodeURIComponent(String(id ?? ''))}`,
    delete: ({ id }) => `/api/v2/api_key/${encodeURIComponent(String(id ?? ''))}`,
    permissions: {
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canShow: true,
      canPatch: true,
    },
  },
} satisfies Record<string, AdminResourceDescriptor>

export const adminEntityDefinitions = {
  users: {
    key: 'users',
    resourceName: "l'utilisateur",
    descriptor: adminResourceDescriptors.users,
    schemaEndpoint: '/api/v1/admin/users/schema',
    fields: defaultUserFields(),
    detailFields: defaultUserFields(),
    editableFields: defaultUserFields(),
    permissions: adminResourceDescriptors.users.permissions,
    actions: { canShow: true, canCreate: true, canEdit: true, canDelete: true },
  },
  roles: {
    key: 'roles',
    resourceName: 'le rôle',
    descriptor: adminResourceDescriptors.roles,
    schemaEndpoint: '/api/v1/admin/role/schema',
    fields: [{ key: 'name', label: 'Nom', type: 'string' }],
    detailFields: [{ key: 'name', label: 'Nom', type: 'string' }],
    editableFields: [],
    permissions: adminResourceDescriptors.roles.permissions,
    actions: { canShow: true },
  },
  groups: {
    key: 'groups',
    resourceName: 'le groupe',
    descriptor: adminResourceDescriptors.groups,
    schemaEndpoint: '/api/v1/admin/user_group/schema',
    fields: [{ key: 'name', label: 'Nom', type: 'string' }],
    detailFields: [{ key: 'name', label: 'Nom', type: 'string' }],
    editableFields: [{ key: 'name', label: 'Nom', type: 'string' }],
    permissions: adminResourceDescriptors.groups.permissions,
    actions: { canShow: true, canCreate: true, canEdit: true, canDelete: true },
  },
  apiKeys: {
    key: 'apiKeys',
    resourceName: "la clé d'API",
    descriptor: adminResourceDescriptors.apiKeys,
    schemaEndpoint: '/api/v2/api_key/schema',
    fields: [
      { key: 'name', label: 'Nom', type: 'string' },
      { key: 'prefix', label: 'Préfixe', type: 'string' },
    ],
    detailFields: [
      { key: 'name', label: 'Nom', type: 'string' },
      { key: 'prefix', label: 'Préfixe', type: 'string' },
    ],
    editableFields: [
      { key: 'name', label: 'Nom', type: 'string' },
    ],
    permissions: adminResourceDescriptors.apiKeys.permissions,
    actions: { canShow: true, canCreate: true, canEdit: true, canDelete: true },
  },
} satisfies Record<string, EntityDefinition>

export function getAdminResourceDescriptor(resource: keyof typeof adminResourceDescriptors): AdminResourceDescriptor {
  return adminResourceDescriptors[resource]
}

export function getAdminEntityDefinition(resource: keyof typeof adminEntityDefinitions): EntityDefinition {
  return adminEntityDefinitions[resource]
}

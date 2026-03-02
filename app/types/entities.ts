import type { DataTableHeader } from 'vuetify'
import type { AdminResourceDescriptor, AdminResourceUiPermissions } from '~/types/admin-resource'

export type EntityFieldType = 'normal' | 'string' | 'int' | 'date' | 'image' | 'boolean' | 'object'

export type EntityFilterItem = {
  title: string
  value: string
}

export type EntityFilterConfig = {
  key: string
  label: string
  icon?: string
  items?: EntityFilterItem[]
}

export type EntityFieldConfig = {
  key: string
  label: string
  type?: EntityFieldType
  endpoint?: string
  targetClass?: string
  readonly?: boolean
  patchable?: boolean
}

export type EntityActionConfig = {
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canShow?: boolean
  canPatch?: boolean
}

export type EntityDefinition = {
  key: string
  title?: string
  description?: string
  resourceName?: string
  columns?: DataTableHeader[]
  filters?: EntityFilterConfig[]
  fields?: EntityFieldConfig[]
  detailFields?: EntityFieldConfig[]
  editableFields?: EntityFieldConfig[]
  schemaEndpoint?: string
  descriptor: AdminResourceDescriptor
  permissions?: Partial<AdminResourceUiPermissions>
  actions?: EntityActionConfig
}

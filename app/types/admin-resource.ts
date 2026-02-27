export type AdminEndpointResolverParams = {
  id?: string
  relationId?: string
}

export type AdminResourceEndpoint = string | ((params: AdminEndpointResolverParams) => string)

export type AdminResourceListEndpoint =
  | AdminResourceEndpoint
  | {
    endpoint: AdminResourceEndpoint
    countEndpoint?: AdminResourceEndpoint
  }

export type AdminResourceRelationActions = {
  list?: AdminResourceEndpoint
  create?: AdminResourceEndpoint
  edit?: AdminResourceEndpoint
  patch?: AdminResourceEndpoint
  delete?: AdminResourceEndpoint
}

export type AdminResourceUiPermissions = {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canShow: boolean
  canPatch: boolean
}

export type AdminResourceDescriptor = {
  schemaEndpoint?: AdminResourceEndpoint
  list: AdminResourceListEndpoint
  show?: AdminResourceEndpoint
  create?: AdminResourceEndpoint
  edit?: AdminResourceEndpoint
  patch?: AdminResourceEndpoint
  delete?: AdminResourceEndpoint
  relationActions?: Record<string, AdminResourceRelationActions>
  permissions?: Partial<AdminResourceUiPermissions>
}

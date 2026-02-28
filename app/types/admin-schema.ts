export type AdminSchemaField = {
  name: string
  type?: string
  targetClass?: string
  endpoint?: string
}

export type AdminResourceSchema = {
  displayable: AdminSchemaField[]
  editable: AdminSchemaField[]
  creatable: {
    fields: AdminSchemaField[]
    required: string[]
  } | false
  isEditable: boolean
  isCreatable: boolean
}

import type { DataTableHeader } from 'vuetify'
import type { AdminResourceSchema, AdminSchemaField } from '~/types/admin-schema'

export type AdminFieldConfig = {
  key: string
  label: string
  type?: 'normal' | 'string' | 'int' | 'date' | 'image' | 'boolean' | 'object'
  endpoint?: string
  targetClass?: string
}

function toSchemaFieldType(value: string | undefined): AdminFieldConfig['type'] {
  if (value === 'normal' || value === 'string' || value === 'int' || value === 'date' || value === 'image' || value === 'boolean' || value === 'object') {
    return value
  }

  return 'normal'
}

export function toFieldLabel(fieldName: string) {
  return fieldName
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[_.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, value => value.toUpperCase())
}

export function normalizeSchemaField(entry: unknown): AdminSchemaField | null {
  if (!entry || typeof entry !== 'object') {
    return null
  }

  const row = entry as Record<string, unknown>
  const name = String(row.name ?? '').trim()

  if (!name) {
    return null
  }

  return {
    name,
    type: String(row.type ?? '').trim() || undefined,
    targetClass: String(row.targetClass ?? '').trim() || undefined,
    endpoint: String(row.endpoint ?? '').trim() || undefined,
  }
}

export function normalizeAdminSchema(payload: unknown): AdminResourceSchema | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const body = payload as { displayable?: unknown; editable?: unknown }
  const displayable = Array.isArray(body.displayable)
    ? body.displayable.map(normalizeSchemaField).filter((field): field is AdminSchemaField => Boolean(field))
    : []
  const editable = Array.isArray(body.editable)
    ? body.editable.map(normalizeSchemaField).filter((field): field is AdminSchemaField => Boolean(field))
    : []

  if (displayable.length === 0 && editable.length === 0) {
    return null
  }

  return { displayable, editable }
}

export function buildSchemaColumns(schema: AdminResourceSchema | null, fallbackColumns: DataTableHeader[]): DataTableHeader[] {
  if (!schema) {
    return fallbackColumns
  }

  const displayableNames = schema.displayable.map(field => field.name)
  const editableNames = schema.editable.map(field => field.name)
  const mergedNames = [...displayableNames, ...editableNames.filter(name => !displayableNames.includes(name))]

  const namesToRender = mergedNames.length > 0 ? mergedNames : fallbackColumns.map(column => String(column.key ?? '')).filter(Boolean)

  if (namesToRender.length === 0) {
    return fallbackColumns
  }

  return namesToRender.map(name => ({
    title: toFieldLabel(name),
    key: name,
  }))
}

export function buildSchemaFieldConfigs(
  schemaFields: AdminSchemaField[] | undefined,
  fallbackFields: AdminFieldConfig[],
): AdminFieldConfig[] {
  if (!schemaFields?.length) {
    return fallbackFields
  }

  return schemaFields.map(field => ({
    key: field.name,
    label: toFieldLabel(field.name),
    type: toSchemaFieldType(field.type),
    endpoint: field.endpoint,
    targetClass: field.targetClass,
  }))
}

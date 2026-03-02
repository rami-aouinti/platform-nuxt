import { createError } from 'h3'
import type { AddressDto, AddressUpsertDto } from '../types/address'

const REQUIRED_ADDRESS_FIELDS = ['street', 'city', 'postalCode', 'countryCode'] as const

type AddressPayloadCandidate = Record<string, unknown>

function asNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function resolveParentAddressId(payload: AddressPayloadCandidate): string | null {
  const directParent = asNonEmptyString(payload.parentAddressId)
  if (directParent) {
    return directParent
  }

  const parentAddress = payload.parentAddress
  if (parentAddress && typeof parentAddress === 'object') {
    const parentId = asNonEmptyString((parentAddress as Record<string, unknown>).id)
    if (parentId) {
      return parentId
    }
  }

  const legacyAddress = payload.address
  if (legacyAddress && typeof legacyAddress === 'object') {
    const legacyId = asNonEmptyString((legacyAddress as Record<string, unknown>).id)
    if (legacyId) {
      return legacyId
    }
  }

  return asNonEmptyString(legacyAddress)
}

function normalizeAddressRecord(payload: AddressPayloadCandidate): AddressPayloadCandidate {
  const parentAddressId = resolveParentAddressId(payload)
  const normalized: AddressPayloadCandidate = {
    ...payload,
    parentAddressId,
    parentAddress: parentAddressId ? { id: parentAddressId } : null,
  }

  delete normalized.address

  return normalized
}

function ensureRequiredAddressFields(payload: AddressPayloadCandidate) {
  const missingFields = REQUIRED_ADDRESS_FIELDS.filter(field => !asNonEmptyString(payload[field]))

  if (missingFields.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid address payload.',
      message: `Missing required address field(s): ${missingFields.join(', ')}.`,
    })
  }
}

export function normalizeAddressPayload(payload: unknown): AddressUpsertDto {
  if (!payload || typeof payload !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid address payload.',
      message: 'Address payload must be a JSON object.',
    })
  }

  const normalized = normalizeAddressRecord(payload as AddressPayloadCandidate)
  ensureRequiredAddressFields(normalized)

  return normalized as AddressUpsertDto
}

export function normalizeAddressResponse(payload: unknown): unknown {
  if (Array.isArray(payload)) {
    return payload.map(item => normalizeAddressResponse(item))
  }

  if (!payload || typeof payload !== 'object') {
    return payload
  }

  const row = payload as Record<string, unknown>

  if (Array.isArray(row.items)) {
    return {
      ...row,
      items: row.items.map(item => normalizeAddressResponse(item)),
    }
  }

  return normalizeAddressRecord(row) as AddressDto
}

export type AddressRelation = {
  id: string
}

export type AddressDto = {
  id?: string
  street: string
  city: string
  postalCode: string
  countryCode: string
  parentAddressId?: string | null
  parentAddress?: AddressRelation | null
}

export type AddressUpsertDto = {
  street: string
  city: string
  postalCode: string
  countryCode: string
  parentAddressId?: string | null
}

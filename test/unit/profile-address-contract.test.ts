import { describe, expect, it } from 'vitest'
import { normalizeAddressPayload, normalizeAddressResponse } from '../../server/utils/profile-address-contract'

describe('profile-address-contract', () => {
  it('maps legacy address field to parentAddressId and parentAddress', () => {
    const payload = normalizeAddressPayload({
      street: '1 rue de Paris',
      city: 'Paris',
      postalCode: '75001',
      countryCode: 'FR',
      address: { id: '42' },
    })

    expect(payload).toMatchObject({
      street: '1 rue de Paris',
      city: 'Paris',
      postalCode: '75001',
      countryCode: 'FR',
      parentAddressId: '42',
      parentAddress: { id: '42' },
    })
    expect(payload).not.toHaveProperty('address')
  })

  it('rejects payloads missing required fields', () => {
    expect(() => normalizeAddressPayload({ city: 'Paris' })).toThrowErrorMatchingInlineSnapshot(
      '[Error: Missing required address field(s): street, postalCode, countryCode.]',
    )
  })

  it('normalizes collection responses', () => {
    const response = normalizeAddressResponse({
      items: [
        {
          id: '1',
          street: 'Main',
          city: 'Lyon',
          postalCode: '69000',
          countryCode: 'FR',
          address: '12',
        },
      ],
    }) as { items: Array<Record<string, unknown>> }

    expect(response.items[0]).toMatchObject({
      parentAddressId: '12',
      parentAddress: { id: '12' },
    })
    expect(response.items[0]).not.toHaveProperty('address')
  })
})

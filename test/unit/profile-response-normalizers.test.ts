import { describe, expect, it } from 'vitest'
import {
  normalizeProfileGroups,
  normalizeProfilePayload,
  normalizeProfileRoles,
} from '../../server/utils/profile-response-normalizers'

describe('profile-response-normalizers', () => {
  it('normalizes profile payload with camelCase fields and role ids', () => {
    expect(normalizeProfilePayload({
      id: '20000000-0000-1000-8000-000000000006',
      username: 'john-root',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe-root@test.com',
      language: 'en',
      locale: 'en',
      timezone: 'Europe/Kyiv',
      roles: [{ id: 'ROLE_ROOT' }, { id: 'ROLE_ADMIN' }, 'ROLE_USER'],
    })).toEqual({
      id: '20000000-0000-1000-8000-000000000006',
      username: 'john-root',
      first_name: 'John',
      last_name: 'Doe',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe-root@test.com',
      language: 'en',
      locale: 'en',
      timezone: 'Europe/Kyiv',
      roles: ['ROLE_ROOT', 'ROLE_ADMIN', 'ROLE_USER'],
    })
  })

  it('extracts roles from wrapped payload', () => {
    expect(normalizeProfileRoles({
      id: 'u-1',
      username: 'john-root',
      roles: [{ id: 'ROLE_ROOT' }, { id: 'ROLE_ADMIN' }],
    })).toEqual(['ROLE_ROOT', 'ROLE_ADMIN'])
  })

  it('extracts groups from wrapped payload', () => {
    expect(normalizeProfileGroups({
      id: 'u-1',
      username: 'john-root',
      groups: [
        {
          id: '10000000-0000-1000-8000-000000000005',
          role: { id: 'ROLE_ROOT' },
          name: 'Root users',
        },
      ],
    })).toEqual([
      {
        id: '10000000-0000-1000-8000-000000000005',
        role: { id: 'ROLE_ROOT' },
        name: 'Root users',
      },
    ])
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mutationCacheMocks = vi.hoisted(() => ({
  invalidateProfileMutationCaches: vi.fn(),
  invalidateSocialDataCaches: vi.fn(),
}))

const proxyFactoryMocks = vi.hoisted(() => ({
  createProxyEntityHandler: vi.fn((options: {
    onSuccess?: (event: unknown, paramValue: string) => Promise<void> | void
  }) => {
    return async (event: unknown) => {
      await options.onSuccess?.(event, 'entity-id')
      return { ok: true }
    }
  }),
  createProxyCollectionHandler: vi.fn((options: {
    onSuccess?: (event: unknown) => Promise<void> | void
  }) => {
    return async (event: unknown) => {
      await options.onSuccess?.(event)
      return { ok: true }
    }
  }),
}))

vi.mock('../../server/utils/profile-endpoint-cache', () => ({
  invalidateProfileMutationCaches: mutationCacheMocks.invalidateProfileMutationCaches,
  invalidateSocialDataCaches: mutationCacheMocks.invalidateSocialDataCaches,
}))

vi.mock('../../server/utils/proxy-handler-factory', () => ({
  createProxyEntityHandler: proxyFactoryMocks.createProxyEntityHandler,
  createProxyCollectionHandler: proxyFactoryMocks.createProxyCollectionHandler,
}))

describe('profile mutation handlers cache invalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it.each([
    ['../../server/api/user/[id]/index.patch', { userId: 'entity-id' }],
    ['../../server/api/user/[id]/index.put', { userId: 'entity-id' }],
    ['../../server/api/user/[id]/index.delete', { userId: 'entity-id' }],
    ['../../server/api/role/[role]/index.patch', { roleId: 'entity-id' }],
    ['../../server/api/role/[role]/index.delete', { roleId: 'entity-id' }],
    ['../../server/api/user_group/[id]/index.patch', { groupId: 'entity-id' }],
    ['../../server/api/user_group/[id]/index.put', { groupId: 'entity-id' }],
    ['../../server/api/user_group/[id]/index.delete', { groupId: 'entity-id' }],
  ])('invalidates scoped resources for %s', async (modulePath, expectedScope) => {
    const handler = (await import(modulePath)).default

    await handler({} as never)

    expect(mutationCacheMocks.invalidateProfileMutationCaches).toHaveBeenCalledWith(
      expect.anything(),
      expectedScope,
    )
  })

  it('invalidates user resources after user creation', async () => {
    const createUser = (await import('../../server/api/user/index.post')).default
    const event = { node: { req: { headers: { 'x-user-id': 'creator-user' } } } }

    await createUser(event as never)

    expect(mutationCacheMocks.invalidateProfileMutationCaches).toHaveBeenCalledWith(
      event,
      { userId: 'creator-user' },
    )
  })

  it('invalidates role resources after role creation', async () => {
    const createRole = (await import('../../server/api/role/index.post')).default
    const event = { node: { req: { headers: { 'x-role-id': 'creator-role' } } } }

    await createRole(event as never)

    expect(mutationCacheMocks.invalidateProfileMutationCaches).toHaveBeenCalledWith(
      event,
      { roleId: 'creator-role' },
    )
  })

  it('invalidates group resources after group creation', async () => {
    const createGroup = (await import('../../server/api/user_group/index.post')).default
    const event = { node: { req: { headers: { 'x-group-id': 'creator-group' } } } }

    await createGroup(event as never)

    expect(mutationCacheMocks.invalidateProfileMutationCaches).toHaveBeenCalledWith(
      event,
      { groupId: 'creator-group' },
    )
  })

  it.each([
    '../../server/api/v1/me/friends/requests/[userId]/index.post',
    '../../server/api/v1/me/friends/requests/[id]/accept/index.post',
    '../../server/api/v1/me/friends/[userId].delete',
    '../../server/api/v1/me/notifications/read-all.patch',
  ])('invalidates social data caches for %s', async (modulePath) => {
    const handler = (await import(modulePath)).default

    await handler({} as never)

    expect(mutationCacheMocks.invalidateSocialDataCaches).toHaveBeenCalledWith(
      expect.anything(),
    )
  })
})

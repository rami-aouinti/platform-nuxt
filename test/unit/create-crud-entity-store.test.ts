import { describe, expect, it, vi } from 'vitest'
import { createCrudEntityStore } from '../../app/stores/_factories/createCrudEntityStore'

interface Entity {
  id: string
  name: string
  level: number
}

describe('createCrudEntityStore', () => {
  it('applies optimistic update and keeps list/detail synchronized on success', async () => {
    let resolveUpdate: (value: Entity) => void = () => {}
    const updatePromise = new Promise<Entity>((resolve) => {
      resolveUpdate = resolve
    })

    const store = createCrudEntityStore<Entity, Partial<Entity>, Partial<Entity>, Partial<Entity>>({
      entityLabel: 'Entité',
      fetch: async () => [],
      create: async () => ({ id: '2', name: 'New', level: 1 }),
      update: () => updatePromise,
      patch: async (id, payload) => ({ id, name: String(payload.name || 'Patched'), level: Number(payload.level || 0) }),
      remove: async () => {},
      getId: entity => entity.id,
      applyUpdate: (entity, payload) => ({ ...entity, ...payload }),
      applyPatch: (entity, payload) => ({ ...entity, ...payload }),
      notifier: { success: vi.fn(), error: vi.fn() },
    })

    store.setRows([{ id: '1', name: 'Before', level: 1 }])
    store.setDetail({ id: '1', name: 'Before', level: 1 })

    const pending = store.update('1', { name: 'Optimistic' })
    expect(store.rows.value[0]?.name).toBe('Optimistic')
    expect(store.detail.value?.name).toBe('Optimistic')

    resolveUpdate({ id: '1', name: 'Server', level: 3 })
    await pending

    expect(store.rows.value[0]).toEqual({ id: '1', name: 'Server', level: 3 })
    expect(store.detail.value).toEqual({ id: '1', name: 'Server', level: 3 })
  })

  it('rolls back optimistic update when api call fails', async () => {
    const store = createCrudEntityStore<Entity, Partial<Entity>, Partial<Entity>, Partial<Entity>>({
      entityLabel: 'Entité',
      fetch: async () => [],
      create: async () => ({ id: '2', name: 'New', level: 1 }),
      update: async () => {
        throw new Error('boom')
      },
      patch: async (id, payload) => ({ id, name: String(payload.name || 'Patched'), level: Number(payload.level || 0) }),
      remove: async () => {},
      getId: entity => entity.id,
      applyUpdate: (entity, payload) => ({ ...entity, ...payload }),
      applyPatch: (entity, payload) => ({ ...entity, ...payload }),
      notifier: { success: vi.fn(), error: vi.fn() },
    })

    store.setRows([{ id: '1', name: 'Before', level: 1 }])
    store.setDetail({ id: '1', name: 'Before', level: 1 })

    await expect(store.update('1', { name: 'Optimistic' })).rejects.toThrow('boom')

    expect(store.rows.value[0]).toEqual({ id: '1', name: 'Before', level: 1 })
    expect(store.detail.value).toEqual({ id: '1', name: 'Before', level: 1 })
    expect(store.error.value).toBe('boom')
  })

  it('keeps list and detail in sync when fetching and removing entities', async () => {
    const store = createCrudEntityStore<Entity, Partial<Entity>, Partial<Entity>, Partial<Entity>>({
      entityLabel: 'Entité',
      fetch: async () => [{ id: '1', name: 'Fetched', level: 2 }],
      create: async () => ({ id: '2', name: 'New', level: 1 }),
      update: async (id, payload) => ({ id, name: String(payload.name || 'Updated'), level: Number(payload.level || 0) }),
      patch: async (id, payload) => ({ id, name: String(payload.name || 'Patched'), level: Number(payload.level || 0) }),
      remove: async () => {},
      getId: entity => entity.id,
      applyUpdate: (entity, payload) => ({ ...entity, ...payload }),
      applyPatch: (entity, payload) => ({ ...entity, ...payload }),
      notifier: { success: vi.fn(), error: vi.fn() },
    })

    store.setDetail({ id: '1', name: 'Stale', level: 1 })
    await store.fetch()
    expect(store.detail.value).toEqual({ id: '1', name: 'Fetched', level: 2 })

    await store.remove('1')
    expect(store.rows.value).toEqual([])
    expect(store.detail.value).toBeNull()
  })

  it('coalesces background refreshes during chained mutations', async () => {
    vi.useFakeTimers()
    const refresh = vi.fn(async () => {})
    const store = createCrudEntityStore<Entity, Partial<Entity>, Partial<Entity>, Partial<Entity>>({
      entityLabel: 'Entité',
      fetch: async () => [],
      create: async (payload) => ({ id: String(payload.id || crypto.randomUUID()), name: String(payload.name || 'New'), level: Number(payload.level || 1) }),
      update: async (id, payload) => ({ id, name: String(payload.name || 'Updated'), level: Number(payload.level || 0) }),
      patch: async (id, payload) => ({ id, name: String(payload.name || 'Patched'), level: Number(payload.level || 0) }),
      remove: async () => {},
      getId: entity => entity.id,
      applyUpdate: (entity, payload) => ({ ...entity, ...payload }),
      applyPatch: (entity, payload) => ({ ...entity, ...payload }),
      postMutationSync: {
        mode: 'background',
        refresh,
        debounceMs: 40,
      },
    })

    await store.create({ id: '1', name: 'One' })
    await store.create({ id: '2', name: 'Two' })
    await store.create({ id: '3', name: 'Three' })
    expect(refresh).toHaveBeenCalledTimes(0)

    await vi.advanceTimersByTimeAsync(50)
    expect(refresh).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('supports blocking and none post-mutation refresh modes', async () => {
    const blockingRefresh = vi.fn(async () => {})
    const noneRefresh = vi.fn(async () => {})

    const blockingStore = createCrudEntityStore<Entity, Partial<Entity>, Partial<Entity>, Partial<Entity>>({
      entityLabel: 'Entité',
      fetch: async () => [],
      create: async () => ({ id: '1', name: 'A', level: 1 }),
      update: async (id, payload) => ({ id, name: String(payload.name || 'Updated'), level: Number(payload.level || 0) }),
      patch: async (id, payload) => ({ id, name: String(payload.name || 'Patched'), level: Number(payload.level || 0) }),
      remove: async () => {},
      getId: entity => entity.id,
      applyUpdate: (entity, payload) => ({ ...entity, ...payload }),
      applyPatch: (entity, payload) => ({ ...entity, ...payload }),
      postMutationSync: { mode: 'blocking', refresh: blockingRefresh },
    })

    await blockingStore.create({ name: 'A' })
    expect(blockingRefresh).toHaveBeenCalledTimes(1)

    const noneStore = createCrudEntityStore<Entity, Partial<Entity>, Partial<Entity>, Partial<Entity>>({
      entityLabel: 'Entité',
      fetch: async () => [],
      create: async () => ({ id: '1', name: 'A', level: 1 }),
      update: async (id, payload) => ({ id, name: String(payload.name || 'Updated'), level: Number(payload.level || 0) }),
      patch: async (id, payload) => ({ id, name: String(payload.name || 'Patched'), level: Number(payload.level || 0) }),
      remove: async () => {},
      getId: entity => entity.id,
      applyUpdate: (entity, payload) => ({ ...entity, ...payload }),
      applyPatch: (entity, payload) => ({ ...entity, ...payload }),
      postMutationSync: { mode: 'none', refresh: noneRefresh },
    })

    await noneStore.create({ name: 'A' })
    expect(noneRefresh).toHaveBeenCalledTimes(0)
  })
})

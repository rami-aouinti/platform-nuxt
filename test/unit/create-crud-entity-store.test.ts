import { describe, expect, it, vi } from 'vitest'
import { createCrudEntityStore } from '../../app/stores/_factories/createCrudEntityStore'

interface Entity {
  id: string
  name: string
  level: number
}

describe('createCrudEntityStore', () => {
  it('rolls back optimistic update when api call fails', async () => {
    const store = createCrudEntityStore<Entity, Partial<Entity>, Partial<Entity>, Partial<Entity>>({
      fetchRows: async () => ({ data: [] }),
      create: async () => ({ id: '2', name: 'New', level: 1 }),
      update: async () => {
        throw new Error('boom')
      },
      patch: async (id, payload) => ({ id, name: String(payload.name || 'Patched'), level: Number(payload.level || 0) }),
      remove: async () => {},
      applyUpdate: (entity, payload) => ({ ...entity, ...payload }),
      applyPatch: (entity, payload) => ({ ...entity, ...payload }),
    })

    store.setRows([{ id: '1', name: 'Before', level: 1 }])
    store.setItem({ id: '1', name: 'Before', level: 1 })

    await expect(store.update('1', { name: 'Optimistic' })).rejects.toThrow('boom')

    expect(store.rows.value[0]).toEqual({ id: '1', name: 'Before', level: 1 })
    expect(store.item.value).toEqual({ id: '1', name: 'Before', level: 1 })
    expect(store.error.value).toBe('boom')
  })

  it('applies optimistic update and syncs row/item when mutation succeeds', async () => {
    let resolveUpdate: (value: Entity) => void = () => {}
    const updatePromise = new Promise<Entity>((resolve) => {
      resolveUpdate = resolve
    })

    const store = createCrudEntityStore<Entity, Partial<Entity>, Partial<Entity>, Partial<Entity>>({
      fetchRows: async () => ({ data: [] }),
      create: async () => ({ id: '2', name: 'New', level: 1 }),
      update: () => updatePromise,
      patch: async (id, payload) => ({ id, name: String(payload.name || 'Patched'), level: Number(payload.level || 0) }),
      remove: async () => {},
      applyUpdate: (entity, payload) => ({ ...entity, ...payload }),
      applyPatch: (entity, payload) => ({ ...entity, ...payload }),
      refreshAfterMutation: false,
    })

    store.setRows([{ id: '1', name: 'Before', level: 1 }])
    store.setItem({ id: '1', name: 'Before', level: 1 })

    const pending = store.update('1', { name: 'Optimistic' })
    expect(store.rows.value[0]?.name).toBe('Optimistic')
    expect(store.item.value?.name).toBe('Optimistic')

    resolveUpdate({ id: '1', name: 'Server', level: 3 })
    await pending

    expect(store.rows.value[0]).toEqual({ id: '1', name: 'Server', level: 3 })
    expect(store.item.value).toEqual({ id: '1', name: 'Server', level: 3 })
    expect(store.loading.value).toBe(false)
    expect(store.error.value).toBeNull()
  })

  it('manages loading and error state for fetchRows', async () => {
    const fetchRows = vi.fn().mockRejectedValueOnce(new Error('cannot fetch'))

    const store = createCrudEntityStore<Entity, Partial<Entity>, Partial<Entity>, Partial<Entity>>({
      fetchRows,
      create: async () => ({ id: '2', name: 'New', level: 1 }),
      update: async (id, payload) => ({ id, name: String(payload.name || 'Updated'), level: Number(payload.level || 0) }),
      patch: async (id, payload) => ({ id, name: String(payload.name || 'Patched'), level: Number(payload.level || 0) }),
      remove: async () => {},
      applyUpdate: (entity, payload) => ({ ...entity, ...payload }),
      applyPatch: (entity, payload) => ({ ...entity, ...payload }),
    })

    await expect(store.fetchRows()).rejects.toThrow('cannot fetch')

    expect(store.loading.value).toBe(false)
    expect(store.error.value).toBe('cannot fetch')
    expect(fetchRows).toHaveBeenCalledOnce()
  })
})

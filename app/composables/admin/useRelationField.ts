import { extractCollectionFromPayload } from '~/utils/admin/extractCollectionFromPayload'

type RelationOption = {
  id: string
  label: string
}

type RelationFieldConfig<TItem = unknown> = {
  fieldName: string
  fieldEndpoint?: string
  parentEndpoint: string | (() => string)
  relationEndpoint?: (relationId: string) => string
  mapItem?: (entry: unknown) => TItem | null
  getId?: (item: TItem) => string
  getLabel?: (item: TItem) => string
  optionsQuery?: Record<string, unknown>
  fallbackBodyBuilder?: (relationIds: string[]) => Record<string, unknown>
}

function defaultMapItem(entry: unknown): Record<string, unknown> | null {
  if (!entry || typeof entry !== 'object') {
    return null
  }

  return entry as Record<string, unknown>
}

function defaultGetId(entry: Record<string, unknown>): string {
  return String(entry.id ?? '').trim()
}

function defaultGetLabel(entry: Record<string, unknown>): string {
  return String(entry.label ?? entry.name ?? entry.title ?? entry.id ?? '').trim()
}

export function useRelationField<TItem = Record<string, unknown>>(config: RelationFieldConfig<TItem>) {
  const relationItems = shallowRef<TItem[]>([])
  const options = ref<RelationOption[]>([])
  const loadingItems = ref(false)
  const loadingOptions = ref(false)
  const mutating = ref(false)

  const mapItem = config.mapItem ?? (defaultMapItem as (entry: unknown) => TItem | null)
  const getId = config.getId ?? (defaultGetId as (item: TItem) => string)
  const getLabel = config.getLabel ?? (defaultGetLabel as (item: TItem) => string)

  const attachedIds = computed(() => new Set(relationItems.value.map(item => getId(item as TItem)).filter(Boolean)))

  const availableOptions = computed(() => {
    return options.value.filter(option => !attachedIds.value.has(option.id))
  })

  function normalizeItems(payload: unknown): TItem[] {
    return extractCollectionFromPayload(payload)
      .map(mapItem)
      .filter((item): item is TItem => Boolean(item && getId(item)))
  }

  async function loadOptions() {
    if (!config.fieldEndpoint) {
      options.value = []
      return
    }

    loadingOptions.value = true

    try {
      const payload = await $fetch(config.fieldEndpoint, {
        query: config.optionsQuery,
      })

      options.value = normalizeItems(payload).map((item) => ({
        id: getId(item),
        label: getLabel(item) || getId(item),
      }))
    } finally {
      loadingOptions.value = false
    }
  }

  async function loadRelationItems(request: () => Promise<unknown>) {
    loadingItems.value = true

    try {
      const payload = await request()
      relationItems.value = normalizeItems(payload)
      return relationItems.value
    } finally {
      loadingItems.value = false
    }
  }

  function resolveParentEndpoint() {
    return typeof config.parentEndpoint === 'function' ? config.parentEndpoint() : config.parentEndpoint
  }

  async function updateRelations(nextIds: string[]) {
    const cleanedIds = Array.from(new Set(nextIds.map(value => value.trim()).filter(Boolean)))

    if (config.relationEndpoint) {
      const previousIds = new Set(relationItems.value.map(item => getId(item as TItem)).filter(Boolean))
      const nextSet = new Set(cleanedIds)

      const idsToAdd = cleanedIds.filter(id => !previousIds.has(id))
      const idsToRemove = Array.from(previousIds).filter(id => !nextSet.has(id))

      await Promise.all([
        ...idsToAdd.map(relationId => $fetch(config.relationEndpoint!(relationId), { method: 'POST' })),
        ...idsToRemove.map(relationId => $fetch(config.relationEndpoint!(relationId), { method: 'DELETE' })),
      ])

      return
    }

    const fallbackBody = config.fallbackBodyBuilder
      ? config.fallbackBodyBuilder(cleanedIds)
      : { [config.fieldName]: cleanedIds }

    await $fetch(resolveParentEndpoint(), {
      method: 'PATCH',
      body: fallbackBody,
    })
  }

  async function addRelation(relationId: string) {
    const targetId = relationId.trim()

    if (!targetId) {
      return
    }

    mutating.value = true

    try {
      await updateRelations([...Array.from(attachedIds.value), targetId])
    } finally {
      mutating.value = false
    }
  }

  async function removeRelation(relationId: string) {
    const targetId = relationId.trim()

    if (!targetId) {
      return
    }

    mutating.value = true

    try {
      await updateRelations(Array.from(attachedIds.value).filter(id => id !== targetId))
    } finally {
      mutating.value = false
    }
  }

  return {
    relationItems,
    options,
    availableOptions,
    attachedIds,
    loadingItems,
    loadingOptions,
    mutating,
    normalizeItems,
    loadOptions,
    loadRelationItems,
    addRelation,
    removeRelation,
  }
}

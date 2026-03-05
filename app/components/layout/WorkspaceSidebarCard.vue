<script setup lang="ts">
type SidebarItem = {
  id: string
  label: string
  to?: string
  icon?: string
}

const props = withDefaults(defineProps<{
  items?: SidebarItem[]
  activeId?: string
  sticky?: boolean
  maxHeight?: string
  minWidth?: string
}>(), {
  items: () => [],
  activeId: undefined,
  sticky: true,
  maxHeight: '530px',
  minWidth: '280px',
})

const emit = defineEmits<{
  select: [item: SidebarItem]
}>()

const cardStyle = computed(() => ({
  minWidth: props.minWidth,
  maxHeight: props.maxHeight,
  overflowY: 'auto',
  position: props.sticky ? 'sticky' : 'static',
  top: props.sticky ? '80px' : 'auto',
}))

function handleSelect(item: SidebarItem) {
  emit('select', item)
}
</script>

<template>
  <v-card rounded="xl" elevation="0" class="workspace-sidebar-card" :style="cardStyle">
    <slot>
      <div class="px-4 pt-3 pb-0">
        <v-list class="border-radius-sm" nav density="compact">
          <v-list-item
            v-for="item in props.items"
            :key="item.id"
            class="px-3 py-1 border-radius-lg mb-2"
            :active="item.id === props.activeId"
            :to="item.to"
            color="primary"
            @click="handleSelect(item)"
          >
            <template v-if="item.icon" #prepend>
              <v-icon size="18" class="material-icons-round me-2 text-dark">{{ item.icon }}</v-icon>
            </template>

            <v-list-item-title class="text-dark text-sm">{{ item.label }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </div>
    </slot>
  </v-card>
</template>

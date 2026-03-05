<script setup lang="ts">
type SidebarItem = {
  id: string
  label: string
  to?: string
  icon?: string
}

const props = withDefaults(defineProps<{
  items: SidebarItem[]
  activeId?: string
}>(), {
  activeId: undefined,
})

const emit = defineEmits<{
  select: [item: SidebarItem]
}>()

function handleSelect(item: SidebarItem) {
  emit('select', item)
}
</script>

<template>
  <v-card
    rounded="xl"
    elevation="0"
    class="workspace-sidebar-card"
  >
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
  </v-card>
</template>

<style scoped>
.workspace-sidebar-card {
  min-width: 280px;
  max-height: 530px;
  overflow-y: auto;
  position: sticky;
  top: 24px;
}
</style>

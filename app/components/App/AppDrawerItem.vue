<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import {
  hasAdminPermission,
  type AdminPermission,
} from '~/utils/permissions/admin'

import type { RouteRecordRaw } from 'vue-router'

const { item } = defineProps<{
  item: RouteRecordRaw
}>()
const authStore = useAuthStore()
const { isAuthenticated, rolesLoading, initialized } = storeToRefs(authStore)

const visibleChildren = computed(() =>
  item.children
    ?.filter((child) => child.meta?.icon)
    .filter((child) => !child.meta?.requiresAuth || isAuthenticated.value)
    .filter((child) => {
      if (!child.meta?.requiresAdmin) {
        return true
      }

      if (!initialized.value || rolesLoading.value) {
        return false
      }

      const permission =
        (child.meta?.adminPermission as AdminPermission | undefined) ?? 'admin'
      return hasAdminPermission(authStore.roles, permission)
    })
    .sort((a, b) => (a.meta?.drawerIndex ?? 99) - (b.meta?.drawerIndex ?? 98)),
)
const visibleChildrenNum = computed(() => visibleChildren.value?.length || 0)
const isItem = computed(() => !item.children || visibleChildrenNum.value === 0)
const title = toRef(() => item.meta?.title)
const icon = toRef(() => item.meta?.icon)
// @ts-expect-error unknown type miss match
const to = computed<RouteRecordRaw>(() => ({
  name: item.name || visibleChildren.value?.[0]?.name,
}))
const route = useRoute()
const isActive = computed(() => {
  return route.path.startsWith(item.path)
})
</script>

<template>
  <v-list-item
    v-if="isItem && icon"
    :to="to"
    :prepend-icon="icon"
    active-class="text-primary"
    :title="title"
  />
  <v-list-group v-else-if="icon" :prepend-icon="icon" color="primary">
    <template #activator="{ props: vProps }">
      <v-list-item :title="title" v-bind="vProps" :active="isActive" />
    </template>
    <AppDrawerItem
      v-for="child in visibleChildren"
      :key="child.path"
      :item="child"
    />
  </v-list-group>
</template>

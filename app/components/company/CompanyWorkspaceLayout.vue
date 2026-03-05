<script setup lang="ts">
const props = defineProps<{
  activePage: 'dashboard' | 'setting' | 'projects' | 'teams' | 'billing'
}>()

const route = useRoute()
const rawParams = route.params as Record<string, string | string[] | undefined>

const companyId = computed(() => {
  const param = rawParams.companyId
  return Array.isArray(param) ? (param[0] ?? '') : (param ?? '')
})

const menuItems = computed(() => [
  { id: 'dashboard', label: 'Dashboard', to: `/company/${companyId.value}/dashboard`, icon: 'mdi-view-dashboard-outline' },
  { id: 'setting', label: 'Setting', to: `/company/${companyId.value}/setting`, icon: 'mdi-cog-outline' },
  { id: 'projects', label: 'Projects', to: `/company/${companyId.value}/projects`, icon: 'mdi-briefcase-outline' },
  { id: 'teams', label: 'Teams', to: `/company/${companyId.value}/teams`, icon: 'mdi-account-group-outline' },
  { id: 'billing', label: 'Billing', to: `/company/${companyId.value}/billing`, icon: 'mdi-credit-card-outline' },
])
</script>

<template>
  <v-container fluid>
    <v-row class="px-4">
      <v-col cols="12" lg="3">
        <LayoutWorkspaceSidebarCard
          :items="menuItems"
          :active-id="props.activePage"
        />
      </v-col>

      <v-col cols="12" lg="9">
        <v-card rounded="lg" class="pa-6 workspace-sidebar-card">
          <slot />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

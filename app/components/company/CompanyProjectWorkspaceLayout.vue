<script setup lang="ts">
const props = defineProps<{
  activePage: 'dashboard' | 'repositories' | 'sprint' | 'tasks' | 'teams'
}>()

const route = useRoute()
const rawParams = route.params as Record<string, string | string[] | undefined>

const companyId = computed(() => {
  const param = rawParams.companyId
  return Array.isArray(param) ? (param[0] ?? '') : (param ?? '')
})

const projectId = computed(() => {
  const param = rawParams.projectId
  return Array.isArray(param) ? (param[0] ?? '') : (param ?? '')
})

const menuItems = computed(() => [
  {
    id: 'dashboard',
    label: 'Dashboard',
    to: `/company/${companyId.value}/${projectId.value}/dashboard`,
    icon: 'mdi-view-dashboard-outline',
  },
  {
    id: 'repositories',
    label: 'Repositories',
    to: `/company/${companyId.value}/${projectId.value}/repositories`,
    icon: 'mdi-source-repository',
  },
  {
    id: 'sprint',
    label: 'Sprint',
    to: `/company/${companyId.value}/${projectId.value}/sprint`,
    icon: 'mdi-run-fast',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    to: `/company/${companyId.value}/${projectId.value}/tasks`,
    icon: 'mdi-format-list-checks',
  },
  {
    id: 'teams',
    label: 'Teams',
    to: `/company/${companyId.value}/${projectId.value}/teams`,
    icon: 'mdi-account-group-outline',
  },
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
        <v-card rounded="xl" elevation="0" class="pa-6">
          <slot />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

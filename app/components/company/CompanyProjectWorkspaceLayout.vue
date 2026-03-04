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
    label: 'Dashboard',
    page: 'dashboard',
    to: `/company/${companyId.value}/${projectId.value}/dashboard`,
  },
  {
    label: 'Repositories',
    page: 'repositories',
    to: `/company/${companyId.value}/${projectId.value}/repositories`,
  },
  {
    label: 'Sprint',
    page: 'sprint',
    to: `/company/${companyId.value}/${projectId.value}/sprint`,
  },
  {
    label: 'Tasks',
    page: 'tasks',
    to: `/company/${companyId.value}/${projectId.value}/tasks`,
  },
  {
    label: 'Teams',
    page: 'teams',
    to: `/company/${companyId.value}/${projectId.value}/teams`,
  },
])
</script>

<template>
  <v-row class="px-4">
    <v-col cols="12" lg="3">
      <v-card rounded="xl" elevation="0" class="pa-4">
        <v-list nav density="compact" class="pa-0">
          <v-list-item
            v-for="item in menuItems"
            :key="item.page"
            :to="item.to"
            rounded="lg"
            class="mb-2"
            :active="item.page === props.activePage"
            color="primary"
          >
            <v-list-item-title>{{ item.label }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>

    <v-col cols="12" lg="9">
      <v-card rounded="xl" elevation="0" class="pa-6">
        <slot />
      </v-card>
    </v-col>
  </v-row>
</template>

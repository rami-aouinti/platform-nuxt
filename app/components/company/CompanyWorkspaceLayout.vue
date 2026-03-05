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
  { label: 'Dashboard', page: 'dashboard', to: `/company/${companyId.value}/dashboard` },
  { label: 'Setting', page: 'setting', to: `/company/${companyId.value}/setting` },
  { label: 'Projects', page: 'projects', to: `/company/${companyId.value}/projects` },
  { label: 'Teams', page: 'teams', to: `/company/${companyId.value}/teams` },
  { label: 'Billing', page: 'billing', to: `/company/${companyId.value}/billing` },
])
</script>

<template>
  <v-container fluid>
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
  </v-container>
</template>

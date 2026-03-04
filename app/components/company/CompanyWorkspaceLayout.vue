<script setup lang="ts">
const props = defineProps<{
  activePage: 'dashboard' | 'setting' | 'projects' | 'teams'
}>()

const route = useRoute()

const companyId = computed(() => {
  const param = route.params.companyId
  return Array.isArray(param) ? (param[0] ?? '') : (param ?? '')
})

const menuItems = computed(() => [
  { label: 'Dashboard', page: 'dashboard', to: `/company/${companyId.value}/dashboard` },
  { label: 'Setting', page: 'setting', to: `/company/${companyId.value}/setting` },
  { label: 'Projects', page: 'projects', to: `/company/${companyId.value}/projects` },
  { label: 'Teams', page: 'teams', to: `/company/${companyId.value}/teams` },
])
</script>

<template>
  <div class="grid gap-6 md:grid-cols-[220px_1fr]">
    <aside class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-slate-900">
      <nav class="flex flex-col gap-2">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.page"
          :to="item.to"
          class="rounded-md px-3 py-2 text-sm font-medium transition-colors"
          :class="item.page === props.activePage
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white'"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
    </aside>

    <section class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-slate-900">
      <slot />
    </section>
  </div>
</template>

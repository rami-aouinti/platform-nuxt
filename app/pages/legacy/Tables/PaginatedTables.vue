<template>
  <legacy-page-wrapper container-class="pt-0 px-6 mt-n16" content-class="mt-n3" :md="12">
    <paginated-table />
  </legacy-page-wrapper>
</template>
<script setup lang="ts">
import LegacyPageWrapper from "../../../components/legacy-migration/layouts/LegacyPageWrapper.vue";
import PaginatedTable from "./Tables/PaginatedTable.vue";

definePageMeta({
  title: 'Legacy · Tables Paginated Tables',
  layout: 'administration',
  requiresAuth: true,
  middleware: ['auth']
})

</script>

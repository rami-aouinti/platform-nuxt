<template>
  <legacy-page-wrapper container-class="px-6 mt-n16" content-class="pt-0" :md="12">
    <sortable-light />
    <sortable-translucent />
    <sortable-dark />
  </legacy-page-wrapper>
</template>
<script setup lang="ts">
import LegacyPageWrapper from "../../../components/legacy-migration/layouts/LegacyPageWrapper.vue";
import SortableDark from "./Tables/SortableDark.vue";
import SortableLight from "./Tables/SortableLight.vue";
import SortableTranslucent from "./Tables/SortableTranslucent.vue";

definePageMeta({
  title: 'Legacy · Tables Sortable Tables',
  layout: 'administration',
  requiresAuth: true,
  middleware: ['auth']
})

</script>

<template>
  <div>
    <v-container fluid class="px-6 mt-n16">
      <v-row>
        <v-col cols="12" class="pt-0">
          <sortable-light></sortable-light>
          <sortable-translucent></sortable-translucent>
          <sortable-dark></sortable-dark>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Legacy · Tables Sortable Tables',
  layout: 'administration',
  requiresAuth: true,
  middleware: ['auth']
})

import SortableDark from "@/components/legacy/Tables/SortableDark.vue";
import SortableLight from "@/components/legacy/Tables/SortableLight.vue";
import SortableTranslucent from "@/components/legacy/Tables/SortableTranslucent.vue";
</script>

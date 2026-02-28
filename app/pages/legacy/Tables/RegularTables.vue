<template>
  <div>
    <v-container fluid class="px-6 mt-n16">
      <v-row>
        <v-col class="pt-0" cols="12">
          <light-table-pagination></light-table-pagination>
          <table-inline-actions></table-inline-actions>
          <table-inline-actions-striped></table-inline-actions-striped>
          <check-toggles-table></check-toggles-table>
          <light-table-transparent></light-table-transparent>
          <dark-table></dark-table>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Legacy · Tables Regular Tables',
  layout: 'administration',
  requiresAuth: true,
  middleware: ['auth']
})

import LightTablePagination from "@/components/legacy/Dashboard/LightTablePagination.vue";
import LightTableTransparent from "@/components/legacy/Dashboard/LightTableTransparent.vue";
import TableInlineActions from "@/components/legacy/Dashboard/TableInlineActions.vue";
import TableInlineActionsStriped from "@/components/legacy/Dashboard/TableInlineActionsStriped.vue";
import CheckTogglesTable from "@/components/legacy/Dashboard/CheckTogglesTable.vue";
import DarkTable from "@/components/legacy/Dashboard/DarkTable.vue";
</script>

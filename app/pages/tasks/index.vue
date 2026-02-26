<script setup lang="ts">
import TaskBoardAndTable from "~/components/task/TaskBoardAndTable.vue";

definePageMeta({
  title: 'Tasks',
  icon: 'mdi-format-list-checks',
  requiresAuth: true,
  layout: 'default',
  middleware: ['auth'],
})
</script>

<template>
  <TaskBoardAndTable />
</template>

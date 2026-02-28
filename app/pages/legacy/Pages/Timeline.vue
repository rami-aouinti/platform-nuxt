<template>
  <legacy-page-wrapper :fluid="false" container-class="mt-n16 px-6" content-class="">
    <v-row>
      <v-col cols="12" md="6">
        <legacy-timeline-block title="Timeline" :items="timeline" />
      </v-col>
      <v-col cols="12" md="6">
        <legacy-timeline-block title="Dark Timeline" :items="timeline" dark />
      </v-col>
    </v-row>
  </legacy-page-wrapper>
</template>

<script setup lang="ts">
import { ref } from "vue";
import LegacyPageWrapper from '../../../components/legacy-migration/layouts/LegacyPageWrapper.vue';
import LegacyTimelineBlock from '../../../components/legacy-migration/composites/LegacyTimelineBlock.vue';
const timeline = ref([{
  title: 'New message',
  color: '#b0eed3',
  iconColor: '#1aae6f',
  icon: 'ni-bell-55',
  btn: 'badge-success',
  time: '10:30 AM',
  description: 'Nullam id dolor id nibh ultricies vehicula ut id elit. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
  tags: ['Design', 'System', 'Creative']
}, {
  title: 'Product Issue',
  color: '#fdd1da',
  iconColor: '#f80031',
  icon: 'ni-html5',
  btn: 'badge-danger',
  time: '11:00 AM',
  description: 'Nullam id dolor id nibh ultricies vehicula ut id elit. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
  tags: ['Design', 'System', 'Creative']
}, {
  title: 'New likes',
  color: '#aaedf9',
  iconColor: '#03acca',
  icon: 'ni-like-2',
  btn: 'badge-info',
  time: '11:45 AM',
  description: 'Nullam id dolor id nibh ultricies vehicula ut id elit. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
  tags: ['Design', 'System', 'Creative']
}]);
</script>

<template>
  <div>
    <v-container fluid class="px-6 py-6">
      <v-row>
        <v-col cols="12">
          <div class="d-flex mb-2">
            <div class="pe-6 mt-1 position-relative ms-auto">
              <p class="text-secondary text-xs font-weight-bold mb-2">
                Team members:
              </p>
              <div class="d-flex align-center justify-center">
                <span class="avatar-group d-flex">
                  <v-tooltip
                    top
                    color="#212529"
                    v-for="(avatar, index) in avatars"
                    :key="avatar.name"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-avatar
                        v-bind="attrs"
                        v-on="on"
                        size="36"
                        class="border border-white"
                        :class="index != 0 ? 'ms-n3' : ''"
                      >
                        <img :src="avatar.image" alt="Avatar" />
                      </v-avatar>
                    </template>
                    <span>{{ avatar.name }}</span>
                  </v-tooltip>
                </span>
              </div>
              <hr class="vertical dark mt-0" />
            </div>
            <div class="ps-6">
              <v-btn
                icon
                color="#fff"
                width="40px"
                height="40px"
                class="ms-auto btn-info bg-gradient-info border-radius-md mt-4"
              >
                <v-icon size="18" class="material-icons-round">add</v-icon>
              </v-btn>
            </div>
          </div>
        </v-col>
        <v-col cols="12">
          <kanban-board :stages="stages" :blocks="blocks">
            <template v-for="block in blocks" #[block.id] :key="block.id">
              <div class="pa-1">
              <div v-if="block.image">
                <v-img :src="block.image" class="border-radius-md mb-3"></v-img>
              </div>
              <div v-if="block.badge">
                <v-btn
                  elevation="0"
                  small
                  :ripple="false"
                  height="21"
                  class="
                    border-radius-md
                    font-weight-bolder
                    px-2
                    py-2
                    badge-font-size
                    ms-auto
                    text-white text-xxs
                    mb-2
                  "
                  :class="`bg-gradient-` + block.badgeColor"
                  >{{ block.badge }}</v-btn
                >
              </div>
              <div v-if="block.title">
                <p class="text text-body font-weight-light mb-0">
                  {{ block.title }}
                </p>
              </div>
              <div v-if="block.files">
                <div class="d-flex mt-3">
                  <div>
                    <i
                      class="fa fa-paperclip me-1 text-sm"
                      aria-hidden="true"
                    ></i>
                    <span class="text-sm">{{ block.files }}</span>
                  </div>
                  <span class="avatar-group ms-auto d-flex">
                    <v-tooltip
                      top
                      color="#212529"
                      v-for="avatar in block.avatars"
                      :key="avatar.name"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-avatar
                          v-bind="attrs"
                          v-on="on"
                          size="24"
                          class="border border-white"
                        >
                          <img :src="avatar.image" alt="Avatar" />
                        </v-avatar>
                      </template>
                      <span>{{ avatar.name }}</span>
                    </v-tooltip>
                  </span>
                </div>
              </div>
              </div>
            </template>
          </kanban-board>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Legacy · Kanban',
  layout: 'administration',
  requiresAuth: true,
  middleware: ['auth']
})

import { ref } from "vue";
import vueKanban from "vue-kanban";
import "vue-kanban/src/assets/kanban.scss";
import imageTeam1 from "@/assets/img/team-1.jpg";
import imageTeam2 from "@/assets/img/team-2.jpg";
import imageTeam3 from "@/assets/img/team-3.jpg";
import imageTeam4 from "@/assets/img/team-4.jpg";
import imageTeam5 from "@/assets/img/team-5.jpg";
import imageOfficeDark from "@/assets/img/office-dark.jpg";
import imageMeeting from "@/assets/img/meeting.jpg";
import imageHomeDecor1 from "@/assets/img/home-decor-1.jpg";
Vue.use(vueKanban);
const avatars = ref([{
  image: imageTeam1,
  name: "Elena Morison"
}, {
  image: imageTeam2,
  name: "Ryan Milly"
}, {
  image: imageTeam3,
  name: "Nick Daniel"
}, {
  image: imageTeam4,
  name: "Peterson"
}, {
  image: imageTeam5,
  name: "Milla"
}]);
const stages = ref(["Backlog", "In progress", "In review", "Done"]);
const blocks = ref([{
  id: 1,
  status: "Backlog",
  title: "Write here your task"
}, {
  id: 2,
  status: "Backlog",
  title: 'Drag me to "In Progress" section'
}, {
  id: 3,
  image: imageOfficeDark,
  status: "Backlog",
  title: "Website Design: New cards for blog section and profile details",
  badge: "Pending",
  badgeColor: "primary",
  files: "3",
  avatars: [{
    image: imageTeam1,
    name: "Elena Morison"
  }, {
    image: imageTeam2,
    name: "Ryan Milly"
  }, {
    image: imageTeam3,
    name: "Nick Daniel"
  }]
}, {
  id: 4,
  status: "In progress",
  title: "Fix Firefox errors",
  badge: "Errors",
  badgeColor: "warning",
  files: "11",
  avatars: [{
    image: imageTeam2,
    name: "Ryan Milly"
  }, {
    image: imageTeam3,
    name: "Nick Daniel"
  }]
}, {
  id: 5,
  status: "In progress",
  title: "Fix Firefox errors",
  badge: "Updates",
  badgeColor: "info",
  files: "3",
  avatars: [{
    image: imageTeam4,
    name: "Ryan Milly"
  }, {
    image: imageTeam1,
    name: "Nick Daniel"
  }]
}, {
  id: 6,
  image: imageMeeting,
  status: "In progress",
  title: "Vue 3 Updates",
  badge: "Updates",
  badgeColor: "info",
  files: "9",
  avatars: [{
    image: imageTeam1,
    name: "Elena Morison"
  }, {
    image: imageTeam2,
    name: "Ryan Milly"
  }, {
    image: imageTeam4,
    name: "Nick Daniel"
  }]
}, {
  id: 7,
  status: "In review",
  title: "Responsive changes",
  badge: "In testing",
  badgeColor: "warning",
  files: "11",
  avatars: [{
    image: imageTeam2,
    name: "Ryan Milly"
  }, {
    image: imageTeam4,
    name: "Nick Daniel"
  }]
}, {
  id: 8,
  status: "In review",
  title: "Change images dimension",
  badge: "In review",
  badgeColor: "success",
  avatars: [{
    image: imageTeam2,
    name: "Ryan Milly"
  }, {
    image: imageTeam4,
    name: "Nick Daniel"
  }]
}, {
  id: 9,
  status: "In review",
  title: "Update links",
  badge: "In review",
  badgeColor: "info",
  files: "6",
  avatars: [{
    image: imageTeam1,
    name: "Ryan Milly"
  }, {
    image: imageTeam3,
    name: "Nick Daniel"
  }]
}, {
  id: 10,
  image: imageHomeDecor1,
  status: "Done",
  title: "Redesign for the home page",
  badge: "Done",
  badgeColor: "success",
  files: "8",
  avatars: [{
    image: imageTeam1,
    name: "Elena Morison"
  }, {
    image: imageTeam2,
    name: "Ryan Milly"
  }, {
    image: imageTeam4,
    name: "Nick Daniel"
  }]
}, {
  id: 11,
  status: "Done",
  title: "Schedule winter campaign",
  badge: "Done",
  badgeColor: "success",
  files: "2",
  avatars: [{
    image: imageTeam1,
    name: "Ryan Milly"
  }, {
    image: imageTeam4,
    name: "Nick Daniel"
  }]
}]);
</script>

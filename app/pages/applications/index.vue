<script setup lang="ts">
import logoSlack from '@/assets/img/small-logos/logo-slack.svg'
import logoSpotify from '@/assets/img/small-logos/logo-spotify.svg'
import logoXd from '@/assets/img/small-logos/logo-xd.svg'
import logoAsana from '@/assets/img/small-logos/logo-asana.svg'
import logoInvision from '@/assets/img/small-logos/logo-invision.svg'
import logoAtlassian from '@/assets/img/small-logos/logo-atlassian.svg'
import team1 from '@/assets/img/team-1.jpg'
import team2 from '@/assets/img/team-2.jpg'
import team3 from '@/assets/img/team-3.jpg'
import team4 from '@/assets/img/team-4.jpg'
import team5 from '@/assets/img/team-5.jpg'

definePageMeta({
  title: 'Applications',
  icon: 'mdi-apps',
  drawerIndex: 5,
  requiresAuth: true,
  layout: 'default',
  middleware: ['auth'],
})

type ApplicationCard = {
  image: string
  title: string
  description: string
  participants: number
  dueDate: string
  avatars: string[]
}

const applications: ApplicationCard[] = [
  {
    image: logoSlack,
    title: 'Slack Bot',
    description:
      "If everything I did failed - which it doesn't, I think that it actually succeeds.",
    participants: 5,
    dueDate: '02.03.22',
    avatars: [team1, team2, team3, team4, team3],
  },
  {
    image: logoSpotify,
    title: 'Premium support',
    description:
      "Pink is obviously a better color. Everyone's born confident, and everything's taken away from you.",
    participants: 3,
    dueDate: '22.11.21',
    avatars: [team4, team3, team2],
  },
  {
    image: logoXd,
    title: 'Design tools',
    description:
      "Constantly growing. We're constantly making mistakes from which we learn and improve.",
    participants: 4,
    dueDate: '06.03.20',
    avatars: [team4, team3, team5, team2],
  },
  {
    image: logoAsana,
    title: 'Looking great',
    description:
      'You have the opportunity to play this game of life you need to appreciate every moment.',
    participants: 6,
    dueDate: '14.03.24',
    avatars: [team5, team4, team2, team3, team5, team2],
  },
  {
    image: logoInvision,
    title: 'Developer first',
    description:
      'For standing out. But the time is now to be okay to be the greatest you.',
    participants: 4,
    dueDate: '16.01.22',
    avatars: [team5, team4, team5, team2],
  },
  {
    image: logoAtlassian,
    title: 'Product Development',
    description:
      'We strive to embrace and drive change in our industry. We are happy to work at such a project.',
    participants: 4,
    dueDate: '24.01.22',
    avatars: [team5, team2, team5, team4],
  },
]
</script>

<template>
  <v-container fluid class="pa-6 bg-grey-lighten-4 min-h-screen">
    <v-row>
      <v-col
        v-for="application in applications"
        :key="application.title"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card rounded="xl" elevation="4" class="h-100 pa-6">
          <div class="d-flex align-start">
            <v-avatar size="72" rounded="xl" color="grey-darken-4" class="mt-n10">
              <v-img :src="application.image" width="48" height="48" />
            </v-avatar>

            <div class="ms-4 flex-grow-1">
              <h2 class="text-h5 font-weight-bold text-primary mb-2">{{ application.title }}</h2>
              <div class="d-flex align-center ga-1">
                <v-avatar
                  v-for="(avatar, index) in application.avatars"
                  :key="`${application.title}-${index}`"
                  size="28"
                  class="border-sm border-white"
                  :style="index ? 'margin-left: -8px;' : ''"
                >
                  <v-img :src="avatar" :alt="`Participant ${index + 1}`" cover />
                </v-avatar>
              </div>
            </div>

            <v-btn icon variant="text" color="grey" aria-label="Actions">
              <v-icon icon="mdi-dots-vertical" />
            </v-btn>
          </div>

          <p class="text-body-1 text-medium-emphasis mt-6 mb-6">{{ application.description }}</p>

          <v-divider class="mb-4" />

          <div class="d-flex justify-space-between">
            <div>
              <p class="text-h6 font-weight-bold mb-0">{{ application.participants }}</p>
              <p class="text-body-2 text-medium-emphasis mb-0">Participants</p>
            </div>
            <div class="text-end">
              <p class="text-h6 font-weight-bold mb-0">{{ application.dueDate }}</p>
              <p class="text-body-2 text-medium-emphasis mb-0">Due date</p>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<template>
  <v-card class="card-shadow border-radius-xl mt-6">
    <div class="pa-4">
      <h5 class="text-h5 text-typo font-weight-bold">Notifications</h5>
      <p class="text-sm text-body mb-0">
        Notifications on this page use v-snackbar from Vuetify. Read more details
        <a href="https://vuetifyjs.com/en/api/v-snackbar/" class="text-dark text-decoration-none" target="_blank">here</a>.
      </p>
    </div>
    <v-card-text class="px-4 pt-4">
      <v-row>
        <v-col v-for="item in items" :key="item.color" lg="3" sm="6">
          <v-btn
            elevation="0"
            height="50"
            :ripple="false"
            class="font-weight-bold text-uppercase btn-primary py-2 px-6 me-2 text-xs w-100"
            :class="`bg-gradient-${item.class}`"
            @click="$emit('trigger', item.name)"
          >
            {{ item.name }}<br />notification
          </v-btn>
        </v-col>
      </v-row>
      <v-snackbar top :value="snackbar.visible" :color="snackbar.color" class="snackbar-shadow" @input="$emit('update:visible', $event)">
        <div class="d-flex align-start alert-notify">
          <v-icon size="24" class="text-white me-3 mt-1 material-icons-round">notifications</v-icon>
          <p class="mb-0">
            <span class="font-size-root font-weight-600">Vuetify Snackbar</span>
            <br />
            Turning standard Vuetify alerts into awesome notifications
          </p>
        </div>
        <template #action="{ attrs }">
          <v-btn
            icon
            elevation="0"
            max-width="136"
            :ripple="false"
            height="43"
            class="font-weight-600 text-capitalize py-3 px-6 rounded-sm"
            color="rgba(255,255,255, .85)"
            v-bind="attrs"
            @click="$emit('close')"
          >
            <v-icon size="13">fas fa-times</v-icon>
          </v-btn>
        </template>
      </v-snackbar>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'LegacyNotificationsPanel',
  props: {
    items: { type: Array, required: true },
    snackbar: { type: Object, required: true },
  },
  emits: ['trigger', 'close', 'update:visible'],
}
</script>

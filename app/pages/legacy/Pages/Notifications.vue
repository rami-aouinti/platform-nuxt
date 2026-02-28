<template>
  <legacy-page-wrapper>
    <v-card class="card-shadow border-radius-xl">
      <div class="pa-4">
        <h5 class="text-h5 text-typo font-weight-bold">Alerts</h5>
      </div>
      <v-card-text class="px-4">
        <v-alert
          v-for="item in alerts"
          :key="item.type"
          close-icon="fas fa-times font-size-root font-weight-light text-white"
          :class="`alert alert-${item.type}`"
          dismissible
          dark
        >
          <span class="text-sm">
            A simple {{ item.type }} alert with an
            <a href="javascript:;" class="text-white font-weight-bold text-decoration-none">example link</a>.
            Give it a click if you like.
          </span>
        </v-alert>
      </v-card-text>
    </v-card>

    <legacy-notifications-panel
      :items="snackbars"
      :snackbar="snackbar"
      @trigger="SnackbarShow"
      @close="snackbar.visible = false"
      @update:visible="onSnackbarVisible"
    />
  </legacy-page-wrapper>
</template>

<script>
import LegacyPageWrapper from '../../../components/legacy-migration/layouts/LegacyPageWrapper.vue'
import LegacyNotificationsPanel from '../../../components/legacy-migration/notifications/LegacyNotificationsPanel.vue'

export default {
  name: 'Notifcations',
  components: {
    LegacyPageWrapper,
    LegacyNotificationsPanel,
  },
  data() {
    return {
      snackbar: {
        color: null,
        visible: false,
      },
      snackbars: [
        { color: '#2dce89', class: 'success', name: 'Success' },
        { color: '#11cdef', class: 'info', name: 'Info' },
        { color: '#fb6340', class: 'warning', name: 'Warning' },
        { color: '#f5365c', class: 'danger', name: 'Danger' },
      ],
      alerts: [
        { type: 'primary' },
        { type: 'secondary' },
        { type: 'success' },
        { type: 'danger' },
        { type: 'warning' },
        { type: 'info' },
        { type: 'light' },
        { type: 'dark' },
      ],
    }
  },
  methods: {
    onSnackbarVisible(visible) {
      this.snackbar.visible = visible
    },
    SnackbarShow(type) {
      if (!type) return
      const colorsByType = {
        Info: '#1A73E8',
        Success: '#4CAF50',
        Warning: '#fb8c00',
        Danger: '#F44335',
      }
      this.snackbar = {
        color: colorsByType[type],
        visible: Boolean(colorsByType[type]),
      }
    },
  },
}
</script>

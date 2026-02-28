<template>
  <v-card :class="['card-shadow mb-30', { 'bg-default': dark }]">
    <div :class="headerClass">
      <p :class="titleClass">{{ title }}</p>
    </div>
    <v-card-text class="card-padding">
      <v-timeline :dark="dark" dense align-top class="timeline-line-color">
        <v-timeline-item
          v-for="(item, i) in items"
          :key="`${item.title}-${i}`"
          small
          class="timeline"
        >
          <template #icon>
            <v-avatar size="33" :color="item.color">
              <v-icon :color="item.iconColor" size="16">{{ item.icon }}</v-icon>
            </v-avatar>
          </template>

          <v-card width="480" :class="{ 'bg-default': dark }">
            <v-card-title class="px-0 pt-2 pb-1">
              <span :class="dark ? 'text-white' : 'text-muted'" class="text-caption ls-0 font-weight-600">{{ item.time }}</span>
            </v-card-title>
            <v-card-text class="px-0">
              <h5 :class="dark ? 'text-white' : 'text-typo'" class="text-h5 font-weight-600 mt-3 mb-0">{{ item.title }}</h5>
              <p :class="dark ? 'text-white' : 'text-body'" class="mt-1 mb-0 font-weight-thin">{{ item.description }}</p>
              <div v-if="item.tags?.length" class="mt-3">
                <v-btn
                  v-for="tag in item.tags"
                  :key="tag"
                  elevation="0"
                  small
                  :ripple="false"
                  height="21"
                  class="rounded-pill me-1 font-weight-600 px-3 py-1 badge-font-size"
                  :class="item.btn"
                  :color="item.color"
                >
                  {{ tag }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </v-timeline>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'LegacyTimelineBlock',
  props: {
    title: { type: String, required: true },
    items: { type: Array, required: true },
    dark: { type: Boolean, default: false },
  },
  computed: {
    headerClass() {
      return this.dark ? 'card-header-padding' : 'card-header-padding card-border-bottom'
    },
    titleClass() {
      return this.dark
        ? 'font-weight-600 text-h3 mb-0 text-white'
        : 'font-weight-600 text-h3 text-typo mb-0'
    },
  },
}
</script>

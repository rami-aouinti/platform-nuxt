<template>
  <v-container :fluid="fluid" :class="['md-page', containerClass]">
    <v-row :class="rowClass">
      <v-col :cols="cols" :md="md" :lg="lg" :class="contentClass">
        <slot />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'LegacyPageWrapper',
  props: {
    fluid: { type: Boolean, default: true },
    containerClass: { type: String, default: 'px-6 py-6' },
    rowClass: { type: String, default: 'md-page-section' },
    contentClass: { type: String, default: 'mx-auto' },
    cols: { type: [String, Number], default: 12 },
    md: { type: [String, Number], default: 8 },
    lg: { type: [String, Number], default: null },
  },
}
</script>

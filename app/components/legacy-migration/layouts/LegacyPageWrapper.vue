<template>
  <v-container :fluid="fluid" :class="containerClass">
    <v-row>
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
    contentClass: { type: String, default: 'mx-auto mt-8' },
    cols: { type: [String, Number], default: 12 },
    md: { type: [String, Number], default: 8 },
    lg: { type: [String, Number], default: null },
  },
}
</script>

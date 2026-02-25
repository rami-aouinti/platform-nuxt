<script setup lang="ts">
const props = defineProps<{
  title?: string
  subtitle?: string
  appBarTeleport?: boolean
}>()

const query = defineModel<string>('query', { default: '' })
const location = defineModel<string>('location', { default: '' })

const emit = defineEmits<{
  search: []
}>()
</script>

<template>
  <client-only v-if="props.appBarTeleport">
    <teleport to="#app-bar">
      <div class="offers-search-bar__teleport-content">
        <v-text-field
          v-model="query"
          label="Jobtitel oder Stichwort"
          hide-details
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-magnify"
        />
        <v-text-field
          v-model="location"
          label="Ort oder Remote"
          hide-details
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-map-marker-outline"
        />
        <v-btn
          class="offers-search-bar__cta"
          color="primary"
          size="large"
          @click="emit('search')"
        >
          Jobs finden
        </v-btn>
      </div>
    </teleport>
  </client-only>

  <section v-else class="offers-search-bar">
    <div v-if="title || subtitle" class="offers-search-bar__header">
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </div>
    <div class="offers-search-bar__form">
      <v-text-field
        v-model="query"
        label="Jobtitel oder Stichwort"
        hide-details
        variant="outlined"
        density="comfortable"
        prepend-inner-icon="mdi-magnify"
      />
      <v-text-field
        v-model="location"
        label="Ort oder Remote"
        hide-details
        variant="outlined"
        density="comfortable"
        prepend-inner-icon="mdi-map-marker-outline"
      />
      <v-btn
        class="offers-search-bar__cta"
        color="primary"
        size="large"
        @click="emit('search')"
      >
        Jobs finden
      </v-btn>
    </div>
  </section>
</template>

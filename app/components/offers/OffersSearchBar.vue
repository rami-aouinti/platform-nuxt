<script setup lang="ts">
const props = defineProps<{
  title?: string
  subtitle?: string
  appBarTeleport?: boolean
  showFilterDrawerButton?: boolean
  filterDrawerOpen?: boolean
}>()

const query = defineModel<string>('query', { default: '' })
const location = defineModel<string>('location', { default: '' })

const emit = defineEmits<{
  search: []
  filter: []
}>()

function resetFilters() {
  query.value = ''
  location.value = ''
  emit('search')
}
</script>

<template>
  <client-only v-if="props.appBarTeleport">
    <teleport to="#app-bar">
      <div class="d-flex justify-content-center mx-4">
          <v-text-field
            v-model="query"
            class="offers-search-bar__query-field mx-1"
            label="Jobtitel oder Stichwort"
            hide-details
            variant="outlined"
            density="compact"
            rounded
            prepend-inner-icon="mdi-magnify"
            style="min-width: 250px;"
          />
          <v-text-field
            v-model="location"
            class="offers-search-bar__query-field mx-1"
            label="Ort oder Remote"
            hide-details
            variant="outlined"
            density="compact"
            rounded
            prepend-inner-icon="mdi-map-marker-outline"
            style="min-width: 250px;"
          />
          <v-btn
            class="offers-search-bar__reset mx-1"
            variant="text"
            @click="resetFilters"
          >
            Reset
          </v-btn>
          <v-btn
            class="offers-search-bar__cta mx-1"
            color="primary"
            rounded
            @click="emit('search')"
          >
            Filter
          </v-btn>
          <v-btn
            v-if="props.showFilterDrawerButton"
            class="mx-1"
            :variant="props.filterDrawerOpen ? 'flat' : 'outlined'"
            :color="props.filterDrawerOpen ? 'primary' : undefined"
            prepend-icon="mdi-filter-variant"
            @click="emit('filter')"
          >
            Filter
          </v-btn>
      </div>
    </teleport>
  </client-only>

  <section v-else class="offers-search-bar">
    <div v-if="title || subtitle" class="offers-search-bar__header">
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </div>
    <div
      v-if="props.appBarTeleport"
      class="offers-search-bar__form offers-search-bar__form--teleport"
    >
      <client-only>
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
    </div>
    <div v-else class="offers-search-bar__form">
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
        Filter
      </v-btn>
    </div>
  </section>
</template>

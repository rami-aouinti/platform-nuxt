<script setup lang="ts">
import OfferMatchGauge from './OfferMatchGauge.vue'

export type OfferCardData = {
  id: string
  title: string
  company: string
  location?: string
  salary?: string
  workMode?: string
  publishedAtLabel?: string
  matchingScore?: number
  matchingLabel?: string
  tags?: string[]
  logoText?: string
  status?: string
}

defineProps<{
  offer: OfferCardData
  active?: boolean
  favorited?: boolean
  actionLabel?: string
  actionIcon?: string
}>()

const emit = defineEmits<{
  select: [offerId: string]
  favorite: [offerId: string]
  action: [offerId: string]
}>()
</script>

<template>
  <article
    class="offer-list-card"
    :class="{ 'is-active': active }"
    @click="emit('select', offer.id)"
  >
    <header class="offer-list-card__header">
      <div class="offer-list-card__identity">
        <div class="offer-list-card__logo">
          {{ offer.logoText || offer.company.slice(0, 2).toUpperCase() }}
        </div>
        <div>
          <h3>{{ offer.title }}</h3>
          <p>{{ offer.company }}</p>
        </div>
      </div>
      <v-btn
        size="small"
        variant="text"
        icon
        @click.stop="emit('favorite', offer.id)"
      >
        <v-icon
          :icon="favorited ? 'mdi-heart' : 'mdi-heart-outline'"
          :color="favorited ? 'primary' : undefined"
        />
      </v-btn>
    </header>

    <OfferMatchGauge
      v-if="typeof offer.matchingScore === 'number'"
      :value="offer.matchingScore"
      :label="offer.matchingLabel"
    />

    <div class="offer-list-card__meta">
      <span>{{ offer.location || 'Standort flexibel' }}</span>
      <span>{{ offer.workMode || 'Vollzeit' }}</span>
      <span class="offer-list-card__salary">{{
        offer.salary || 'Gehalt auf Anfrage'
      }}</span>
      <span v-if="offer.publishedAtLabel">{{ offer.publishedAtLabel }}</span>
    </div>

    <div class="offer-list-card__tags">
      <v-chip
        v-for="tag in offer.tags || []"
        :key="tag"
        size="small"
        variant="outlined"
        >{{ tag }}</v-chip
      >
      <v-chip
        v-if="offer.status"
        size="small"
        color="primary"
        variant="tonal"
        >{{ offer.status }}</v-chip
      >
    </div>

    <v-btn
      v-if="actionLabel"
      class="offer-list-card__action"
      color="primary"
      variant="text"
      :prepend-icon="actionIcon"
      @click.stop="emit('action', offer.id)"
    >
      {{ actionLabel }}
    </v-btn>
  </article>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  company: string
  location?: string
  contract?: string
  salary?: string
  description?: string
  highlights?: string[]
  requirements?: string[]
  perks?: string[]
}>()
</script>

<template>
  <section class="offer-details-panel">
    <header class="offer-details-panel__header">
      <div>
        <h2>{{ props.title }}</h2>
        <p>{{ props.company }} · {{ props.location || 'Remote' }} · {{ props.contract || 'Unbefristet' }}</p>
      </div>
      <v-chip color="primary" variant="flat">{{ props.salary || '45k - 70k €' }}</v-chip>
    </header>

    <section>
      <h3>Über diese Stelle</h3>
      <p>{{ props.description || 'Du arbeitest im Produktteam an nutzerzentrierten Features, vom Discovery Workshop bis zum Release.' }}</p>
    </section>

    <section v-if="highlights?.length">
      <h3>Deine Aufgaben</h3>
      <ul>
        <li v-for="item in highlights" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section v-if="requirements?.length">
      <h3>Dein Profil</h3>
      <ul>
        <li v-for="item in requirements" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section v-if="perks?.length">
      <h3>Benefits</h3>
      <ul>
        <li v-for="item in perks" :key="item">{{ item }}</li>
      </ul>
    </section>
  </section>
</template>

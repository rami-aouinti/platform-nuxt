<script setup lang="ts">
export type OfferFilterSection = {
  key: string
  title: string
  items: { label: string; value: string; count?: number }[]
}

const props = defineProps<{
  title?: string
  sections: OfferFilterSection[]
  horizontal?: boolean
}>()

const selected = defineModel<Record<string, string[]>>({ default: {} })

function toggleItem(sectionKey: string, value: string) {
  const current = selected.value[sectionKey] ?? []
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value]

  selected.value = {
    ...selected.value,
    [sectionKey]: next,
  }
}

function isSelected(sectionKey: string, value: string) {
  return (selected.value[sectionKey] ?? []).includes(value)
}
</script>

<template>
  <aside
    class="offers-filters-sidebar"
    :class="{ 'offers-filters-sidebar--horizontal': props.horizontal }"
  >
    <template v-if="props.horizontal">
      <div class="offers-filters-sidebar__horizontal-sections">
        <section
          v-for="section in sections"
          :key="section.key"
          class="offers-filters-sidebar__horizontal-section"
        >
          <p>{{ section.title }}</p>

          <div class="offers-filters-sidebar__chips">
            <v-chip
              v-for="item in section.items"
              :key="`${section.key}-${item.value}`"
              :color="
                isSelected(section.key, item.value) ? 'primary' : undefined
              "
              :variant="
                isSelected(section.key, item.value) ? 'flat' : 'outlined'
              "
              size="small"
              @click="toggleItem(section.key, item.value)"
            >
              {{ item.label }}
              <span
                v-if="typeof item.count === 'number'"
                class="offers-filters-sidebar__count"
                >{{ item.count }}</span
              >
            </v-chip>
          </div>
        </section>
      </div>
    </template>

    <v-expansion-panels v-else multiple variant="accordion">
      <v-expansion-panel
        v-for="section in sections"
        :key="section.key"
        :title="section.title"
      >
        <v-expansion-panel-text>
          <div class="offers-filters-sidebar__chips">
            <v-chip
              v-for="item in section.items"
              :key="`${section.key}-${item.value}`"
              :color="
                isSelected(section.key, item.value) ? 'primary' : undefined
              "
              :variant="
                isSelected(section.key, item.value) ? 'flat' : 'outlined'
              "
              size="small"
              @click="toggleItem(section.key, item.value)"
            >
              {{ item.label }}
              <span
                v-if="typeof item.count === 'number'"
                class="offers-filters-sidebar__count"
                >{{ item.count }}</span
              >
            </v-chip>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </aside>
</template>

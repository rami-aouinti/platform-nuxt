<template>
  <v-row>
    <v-col v-for="field in fields" :key="field.model" :cols="field.cols || 12" :md="field.md || 6" class="py-0">
      <v-text-field
        :value="value[field.model]"
        :label="field.label"
        :type="field.type || 'text'"
        color="#e91e63"
        class="font-size-input input-style"
        @input="$emit('input-field', { key: field.model, value: $event })"
      />
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'LegacyProductFormFields',
  props: {
    value: { type: Object, required: true },
    fields: { type: Array, required: true },
  },
  emits: ['input-field'],
}
</script>

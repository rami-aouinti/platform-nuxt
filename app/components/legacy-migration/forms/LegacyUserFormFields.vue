<template>
  <v-row class="mt-2">
    <v-col v-for="field in fields" :key="field.model" :sm="field.sm || 6" cols="12" class="py-0">
      <v-text-field
        :value="value[field.model]"
        :type="field.type || 'text'"
        :label="field.label"
        color="#e91e63"
        required
        class="font-size-input input-style"
        @input="$emit('input-field', { key: field.model, value: $event })"
      />
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'LegacyUserFormFields',
  props: {
    value: { type: Object, required: true },
    fields: { type: Array, required: true },
  },
  emits: ['input-field'],
}
</script>

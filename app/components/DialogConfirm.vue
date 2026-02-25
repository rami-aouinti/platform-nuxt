<script setup lang="ts">
const dialog = ref(false)
const confirmed = ref(false)
let resolve: (value: boolean) => void
const message = ref('')
const confirmationLabel = ref('')
const expectedConfirmationText = ref('')
const confirmationInput = ref('')

const canConfirm = computed(() => {
  if (!expectedConfirmationText.value) {
    return true
  }

  return confirmationInput.value.trim() === expectedConfirmationText.value
})

const confirmationFieldLabel = computed(() => {
  if (confirmationLabel.value) {
    return confirmationLabel.value
  }

  return `Tapez "${expectedConfirmationText.value}" pour confirmer`
})

const confirmationFieldHint = computed(
  () => `Valeur attendue : ${expectedConfirmationText.value}`,
)

watch(dialog, (v) => {
  if (!v) {
    resolve(confirmed.value)
  }
})

type DialogConfirmOptions = {
  confirmationLabel?: string
  expectedConfirmationText?: string
}

function open(text: string, options: DialogConfirmOptions = {}) {
  confirmed.value = false
  dialog.value = true
  message.value = text
  confirmationLabel.value = options.confirmationLabel ?? ''
  expectedConfirmationText.value = options.expectedConfirmationText ?? ''
  confirmationInput.value = ''

  return new Promise<boolean>((resolveFn) => {
    resolve = resolveFn
  })
}

function confirm() {
  if (!canConfirm.value) {
    return
  }

  confirmed.value = true
  dialog.value = false
}

function cancel() {
  confirmed.value = false
  dialog.value = false
}
defineExpose({ open })
</script>

<template>
  <v-dialog v-model="dialog" max-width="400px">
    <v-card>
      <v-card-text class="font-weight-bold d-flex">
        <v-icon class="mr-2" color="warning" icon="$warning" />
        <span>{{ message }}</span>
      </v-card-text>
      <v-card-text v-if="expectedConfirmationText" class="pt-0">
        <v-text-field
          v-model="confirmationInput"
          :label="confirmationFieldLabel"
          :hint="confirmationFieldHint"
          persistent-hint
          autofocus
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="cancel"> Cancel </v-btn>
        <v-btn color="primary" :disabled="!canConfirm" @click="confirm"> Confirm </v-btn>
        <v-spacer />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

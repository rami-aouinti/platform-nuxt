<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'

interface BasicInfoForm {
  firstName: string
  lastName: string
  gender: string
  birthMonth: string
  birthDay: string
  birthYear: string
  email: string
  confirmEmail: string
  location: string
  phoneNumber: string
  language: string
  skills: string[]
}

const authStore = useAuthStore()
const loading = ref(false)
const saving = ref(false)

const genderOptions = ['Female', 'Male', 'Other']
const monthOptions = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const dayOptions = Array.from({ length: 31 }, (_, index) => String(index + 1))
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 100 }, (_, index) => String(currentYear - index))
const languageOptions = ['English', 'French', 'German', 'Spanish']
const skillOptions = ['Vue.js', 'Nuxt', 'TypeScript', 'API Design', 'UI/UX']

const form = reactive<BasicInfoForm>({
  firstName: '',
  lastName: '',
  gender: '',
  birthMonth: '',
  birthDay: '',
  birthYear: '',
  email: '',
  confirmEmail: '',
  location: '',
  phoneNumber: '',
  language: 'English',
  skills: [],
})

const canSubmit = computed(() => {
  return form.firstName.trim().length > 0 && form.lastName.trim().length > 0 && form.email.trim().length > 0 && form.email === form.confirmEmail
})

async function loadProfile() {
  if (!authStore.token) {
    return
  }

  loading.value = true

  try {
    const response = await $fetch<Record<string, unknown>>('/api/v1/me/profile', {
      headers: { Authorization: `Bearer ${authStore.token}` },
    })

    form.firstName = String(response.firstName ?? '')
    form.lastName = String(response.lastName ?? '')
    form.email = String(response.email ?? '')
    form.confirmEmail = form.email
    form.gender = String(response.gender ?? '')
    form.location = String(response.timezone ?? response.location ?? '')
    form.phoneNumber = String(response.phoneNumber ?? response.phone ?? '')
    form.language = String(response.language ?? 'English')
    form.skills = Array.isArray(response.skills) ? response.skills.map(item => String(item)) : []

    const birthDate = typeof response.birthDate === 'string' ? response.birthDate : ''
    if (birthDate) {
      const parsed = new Date(birthDate)
      if (!Number.isNaN(parsed.getTime())) {
        form.birthMonth = monthOptions[parsed.getUTCMonth()] ?? ''
        form.birthDay = String(parsed.getUTCDate())
        form.birthYear = String(parsed.getUTCFullYear())
      }
    }
  } catch (error) {
    Notify.error(error)
  } finally {
    loading.value = false
  }
}

function buildBirthDate() {
  if (!form.birthMonth || !form.birthDay || !form.birthYear) {
    return undefined
  }

  const monthIndex = monthOptions.findIndex(month => month === form.birthMonth)
  if (monthIndex < 0) {
    return undefined
  }

  const month = String(monthIndex + 1).padStart(2, '0')
  const day = String(form.birthDay).padStart(2, '0')
  return `${form.birthYear}-${month}-${day}`
}

async function saveProfile() {
  if (!authStore.token || !canSubmit.value) {
    return
  }

  saving.value = true

  try {
    await $fetch('/api/v1/me/profile', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        gender: form.gender || undefined,
        birthDate: buildBirthDate(),
        timezone: form.location.trim() || undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
        language: form.language || undefined,
        skills: form.skills,
      },
    })

    await authStore.fetchProfileData()
    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.profileInfoUpdated')))
  } catch (error) {
    Notify.error(error)
  } finally {
    saving.value = false
  }
}

onMounted(loadProfile)
</script>

<template>
  <v-card class="profile-block pa-4 pa-md-6" rounded="xl" elevation="0">
    <h3 class="text-h4 text-typo mb-6">Basic Info</h3>

    <div v-if="loading" class="d-flex align-center ga-3">
      <v-progress-circular indeterminate size="24" color="primary" />
      <span>Chargement...</span>
    </div>

    <v-form v-else @submit.prevent="saveProfile">
      <v-row>
        <v-col cols="12" md="6"><v-text-field v-model="form.firstName" label="First Name" variant="underlined" hide-details="auto" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="form.lastName" label="Last Name" variant="underlined" hide-details="auto" /></v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="4"><v-select v-model="form.gender" :items="genderOptions" label="I'm" variant="underlined" hide-details="auto" /></v-col>
        <v-col cols="12" md="8">
          <label class="text-medium-emphasis d-block mb-2">Birth Date</label>
          <v-row>
            <v-col cols="12" sm="5"><v-select v-model="form.birthMonth" :items="monthOptions" placeholder="Month" variant="underlined" hide-details="auto" /></v-col>
            <v-col cols="6" sm="3"><v-select v-model="form.birthDay" :items="dayOptions" placeholder="Day" variant="underlined" hide-details="auto" /></v-col>
            <v-col cols="6" sm="4"><v-select v-model="form.birthYear" :items="yearOptions" placeholder="Year" variant="underlined" hide-details="auto" /></v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6"><v-text-field v-model="form.email" label="Email" variant="underlined" hide-details="auto" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="form.confirmEmail" label="Confirmation Email" variant="underlined" hide-details="auto" /></v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6"><v-text-field v-model="form.location" label="Your Location" variant="underlined" hide-details="auto" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="form.phoneNumber" label="Phone Number" variant="underlined" hide-details="auto" /></v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6"><v-select v-model="form.language" :items="languageOptions" label="Language" variant="underlined" hide-details="auto" /></v-col>
        <v-col cols="12" md="6"><v-select v-model="form.skills" :items="skillOptions" label="Skills" variant="underlined" chips multiple hide-details="auto" /></v-col>
      </v-row>

      <div class="d-flex justify-end mt-4">
        <v-btn type="submit" color="primary" :loading="saving" :disabled="!canSubmit">Save changes</v-btn>
      </div>
    </v-form>
  </v-card>
</template>

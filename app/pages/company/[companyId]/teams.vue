<script setup lang="ts">
import { useCompanyWorkspaceApi, type CompanyMembership } from '~/composables/useCompanyWorkspaceApi'

definePageMeta({ middleware: ['auth'], requiresAuth: true })

const route = useRoute()
const workspaceApi = useCompanyWorkspaceApi()

const membership = ref<CompanyMembership | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const showAddUserDialog = ref(false)
const addingUser = ref(false)
const addUserError = ref<string | null>(null)
const newMember = reactive({
  email: '',
  role: 'member',
  status: 'invited',
})

const companyId = computed(() => {
  const param = route.params.companyId
  return Array.isArray(param) ? (param[0] ?? '') : (param ?? '')
})

const userDisplayName = computed(() => {
  const user = membership.value?.user
  if (!user) return '-'
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.username || user.email || '-'
})

async function loadMembership() {
  if (!companyId.value) {
    error.value = 'Identifiant de company invalide.'
    membership.value = null
    return
  }

  loading.value = true
  error.value = null

  try {
    membership.value = await workspaceApi.getMembership(companyId.value)
  } catch (errorValue) {
    membership.value = null
    error.value = errorValue instanceof Error ? errorValue.message : 'Impossible de charger les membres.'
  } finally {
    loading.value = false
  }
}

watch(companyId, loadMembership, { immediate: true })

function resetAddUserForm() {
  newMember.email = ''
  newMember.role = 'member'
  newMember.status = 'invited'
  addUserError.value = null
}

function openAddUserDialog() {
  resetAddUserForm()
  showAddUserDialog.value = true
}

async function submitAddUser() {
  if (!companyId.value) {
    addUserError.value = 'Identifiant de company invalide.'
    return
  }

  if (!newMember.email.trim()) {
    addUserError.value = "L'email est requis."
    return
  }

  addingUser.value = true
  addUserError.value = null

  try {
    await workspaceApi.addCompanyMember(companyId.value, {
      email: newMember.email.trim(),
      role: newMember.role.trim() || 'member',
      status: newMember.status.trim() || 'invited',
    })

    showAddUserDialog.value = false
    await loadMembership()
  } catch (errorValue) {
    addUserError.value = errorValue instanceof Error ? errorValue.message : "Impossible d'ajouter le membre."
  } finally {
    addingUser.value = false
  }
}
</script>

<template>
  <CompanyWorkspaceLayout active-page="teams">
    <div class="mb-4 flex items-center justify-between gap-3">
      <h1 class="text-h4 mb-0">Company teams</h1>

      <v-btn color="primary" prepend-icon="mdi-account-plus" @click="openAddUserDialog">
        Add user
      </v-btn>
    </div>

    <div v-if="loading" class="d-flex align-center ga-3">
      <v-progress-circular indeterminate color="primary" />
      <span>Chargement des membres...</span>
    </div>

    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      density="comfortable"
      rounded="lg"
      class="mb-4"
    >
      {{ error }}
    </v-alert>

    <v-alert
      v-else-if="!membership"
      type="info"
      variant="tonal"
      density="comfortable"
      rounded="lg"
      class="mb-4"
    >
      Aucun membre trouvé.
    </v-alert>

    <v-card v-else variant="tonal" rounded="lg" class="workspace-sidebar-card">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <p class="text-caption text-medium-emphasis mb-1">Utilisateur</p>
            <p class="text-body-1 mb-0">{{ userDisplayName }}</p>
          </v-col>
          <v-col cols="12" md="6">
            <p class="text-caption text-medium-emphasis mb-1">Email</p>
            <p class="text-body-1 mb-0">{{ membership.user?.email || '-' }}</p>
          </v-col>
          <v-col cols="12" md="6">
            <p class="text-caption text-medium-emphasis mb-1">Rôle</p>
            <p class="text-body-1 mb-0">{{ membership.role || '-' }}</p>
          </v-col>
          <v-col cols="12" md="6">
            <p class="text-caption text-medium-emphasis mb-1">Statut</p>
            <p class="text-body-1 mb-0">{{ membership.status || '-' }}</p>
          </v-col>
          <v-col cols="12" md="6">
            <p class="text-caption text-medium-emphasis mb-1">Joined at</p>
            <p class="text-body-1 mb-0">{{ membership.joinedAt || '-' }}</p>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-dialog v-model="showAddUserDialog" max-width="520">
      <v-card rounded="lg" class="workspace-sidebar-card">
        <v-card-title class="text-h6">Add user</v-card-title>

        <v-card-text>
          <v-alert
            v-if="addUserError"
            type="error"
            variant="tonal"
            density="comfortable"
            rounded="lg"
            class="mb-4"
          >
            {{ addUserError }}
          </v-alert>

          <v-text-field
            v-model="newMember.email"
            label="Email"
            type="email"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <v-text-field v-model="newMember.role" label="Role" variant="outlined" density="comfortable" class="mb-3" />

          <v-text-field v-model="newMember.status" label="Status" variant="outlined" density="comfortable" />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" :disabled="addingUser" @click="showAddUserDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="addingUser" @click="submitAddUser">Invite</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </CompanyWorkspaceLayout>
</template>

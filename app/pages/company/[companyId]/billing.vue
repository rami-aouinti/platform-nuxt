<script setup lang="ts">
definePageMeta({ middleware: ['auth'], requiresAuth: true })

const invoices = [
  { date: 'March, 01, 2020', id: '#MS-415646', value: '$180' },
  { date: 'February, 10, 2021', id: '#RV-126749', value: '$250' },
  { date: 'April, 05, 2020', id: '#FB-212562', value: '$560' },
  { date: 'June, 25, 2019', id: '#QW-103578', value: '$120' },
  { date: 'March, 01, 2019', id: '#AR-803481', value: '$300' },
]

const billingContacts = [
  { name: 'Oliver Liam', company: 'Viking Burrito', email: 'oliver@burrito.com', vat: 'FRB1235476' },
  { name: 'Lucas Harper', company: 'Stone Tech Zone', email: 'lucas@stone-tech.com', vat: 'FRB1235476' },
  { name: 'Fiber Notion', company: 'Stone Tech Zone', email: 'ethan@fiber.com', vat: 'FRB1235476' },
]

const getInitials = (name: string) => name
  .split(' ')
  .map(part => part.charAt(0))
  .join('')
  .slice(0, 2)
  .toUpperCase()
</script>

<template>
  <CompanyWorkspaceLayout active-page="billing">
    <div class="d-flex align-center justify-space-between mb-4">
      <h1 class="text-h4 mb-0">Company billing</h1>
      <v-btn color="primary" prepend-icon="mdi-plus">Add new card</v-btn>
    </div>

    <v-row>
      <v-col cols="12" md="8">
        <v-card rounded="xl" class="pa-5 text-white billing-primary-card">
          <div class="d-flex align-center justify-space-between mb-8">
            <p class="text-overline mb-0 text-white">Premium account</p>
            <v-icon icon="mdi-credit-card-chip" />
          </div>
          <p class="text-h6 mb-8 tracking-wide">4562 1122 4594 7852</p>
          <div class="d-flex justify-space-between align-end">
            <div>
              <p class="text-caption mb-1 text-white">Card Holder</p>
              <p class="text-body-1 mb-0">Jack Peterson</p>
            </div>
            <div>
              <p class="text-caption mb-1 text-white">Expires</p>
              <p class="text-body-1 mb-0">11/22</p>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="xl" class="pa-4 h-100 card-surface">
          <p class="text-subtitle-1 font-weight-bold mb-3">Invoices</p>
          <v-list density="compact" class="pa-0">
            <v-list-item
              v-for="invoice in invoices"
              :key="invoice.id"
              rounded="lg"
              class="px-3 py-2 mb-2 invoice-item"
            >
              <v-list-item-title>{{ invoice.date }}</v-list-item-title>
              <v-list-item-subtitle>{{ invoice.id }}</v-list-item-subtitle>
              <template #append>
                <v-chip size="small" color="primary" variant="tonal">{{ invoice.value }}</v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="xl" class="pa-4 mt-4 card-surface">
      <div class="d-flex align-center justify-space-between mb-3">
        <p class="text-subtitle-1 font-weight-bold mb-0">Payment Method</p>
      </div>
      <v-row>
        <v-col cols="12" md="6">
          <v-sheet rounded="lg" class="pa-4 d-flex justify-space-between align-center payment-method-sheet">
            <div>
              <p class="text-body-2 font-weight-medium mb-1">Mastercard **** **** **** 7852</p>
              <v-chip size="x-small" color="success" variant="tonal">Primary</v-chip>
            </div>
            <v-btn icon="mdi-pencil" variant="text" color="primary" density="comfortable" />
          </v-sheet>
        </v-col>
        <v-col cols="12" md="6">
          <v-sheet rounded="lg" class="pa-4 d-flex justify-space-between align-center payment-method-sheet">
            <div>
              <p class="text-body-2 font-weight-medium mb-1">Visa **** **** **** 5248</p>
              <v-chip size="x-small" color="info" variant="tonal">Backup</v-chip>
            </div>
            <v-btn icon="mdi-pencil" variant="text" color="primary" density="comfortable" />
          </v-sheet>
        </v-col>
      </v-row>
    </v-card>

    <v-row class="mt-1">
      <v-col cols="12" md="8">
        <v-card rounded="xl" class="pa-4 card-surface">
          <p class="text-subtitle-1 font-weight-bold mb-3">Billing Information</p>

          <v-sheet
            v-for="contact in billingContacts"
            :key="contact.email"
            rounded="lg"
            class="pa-4 mb-3 billing-contact-sheet"
          >
            <div class="d-flex justify-space-between align-start">
              <div class="d-flex ga-3">
                <v-avatar color="primary" variant="tonal" size="40" class="mt-1">
                  {{ getInitials(contact.name) }}
                </v-avatar>
                <div>
                  <p class="text-body-1 font-weight-medium mb-1">{{ contact.name }}</p>
                  <p class="text-caption text-medium-emphasis mb-1">Company Name: {{ contact.company }}</p>
                  <p class="text-caption text-medium-emphasis mb-1">Email Address: {{ contact.email }}</p>
                  <p class="text-caption text-medium-emphasis mb-0">VAT Number: {{ contact.vat }}</p>
                </div>
              </div>
              <div class="d-flex ga-2">
                <v-btn variant="text" color="error" size="small">Delete</v-btn>
                <v-btn variant="text" size="small">Edit</v-btn>
              </div>
            </div>
          </v-sheet>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card rounded="xl" class="pa-4 card-surface">
          <p class="text-subtitle-1 font-weight-bold mb-3">Your Transactions</p>
          <v-list density="comfortable" class="pa-0">
            <v-list-item title="Netflix" subtitle="27 March 2020, at 12:30 PM" append="- $ 2,500" class="px-0" />
            <v-list-item title="Apple" subtitle="23 March 2020, at 04:30 AM" append="+ $ 2,000" class="px-0" />
            <v-list-item title="Stripe" subtitle="26 March 2020, at 13:45 PM" append="+ $ 750" class="px-0" />
            <v-list-item title="HubSpot" subtitle="26 March 2020, at 12:30 PM" append="+ $ 1,000" class="px-0" />
            <v-list-item title="Creative Tim" subtitle="26 March 2020, at 08:30 AM" append="+ $ 2,500" class="px-0" />
            <v-list-item title="Webflow" subtitle="26 March 2020, at 05:00 AM" append="Pending" class="px-0" />
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </CompanyWorkspaceLayout>
</template>

<style scoped>
.billing-primary-card {
  background: linear-gradient(135deg, #111827 0%, #1e3a8a 100%);
  box-shadow: 0 20px 45px rgb(15 23 42 / 35%);
}

.card-surface {
  border: 1px solid rgb(var(--v-theme-on-surface), 0.08);
  box-shadow: 0 8px 24px rgb(15 23 42 / 8%);
}

.payment-method-sheet,
.billing-contact-sheet,
.invoice-item {
  border: 1px solid rgb(var(--v-theme-on-surface), 0.1);
  background: rgb(var(--v-theme-surface));
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.payment-method-sheet:hover,
.billing-contact-sheet:hover,
.invoice-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgb(15 23 42 / 10%);
}
</style>

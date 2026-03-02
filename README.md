<p align="center">
  <img alt="BroWorld - Opinionated Vuetify Admin Starter Template" src="public/vitify-nuxt.svg" width=100px/>
</p>
<h1 align="center">BroWorld</h1>

<p align="center">
  <a href="https://github.com/vuejs/vue">
    <img src="https://img.shields.io/badge/nuxt-4-brightgreen.svg" alt="nuxt">
  </a>
  <a href="https://github.com/vuetifyjs/vuetify">
    <img src="https://img.shields.io/badge/vuetify-3-blue.svg" alt="vuetify">
  </a>
  <a href="https://github.com/rami-aouinti/platform-nuxt/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/mashape/apistatus.svg" alt="license">
  </a>
</p>

<p align='center'>
<b>Vuetify</b> + <b>Nuxt</b>, Opinionated Admin Starter Template<br><br>
</p>

<p align='center'>
<a href="https://github.com/rami-aouinti/platform-nuxt">Live Demo<br><br></a>
</p>

## Features

- 💚 [Nuxt](https://nuxt.com/) - SPA, ESR, File-based routing, components auto importing, modules, etc

- 💥 SSR out of the box - powered by [Vuetify Nuxt module](https://github.com/vuetifyjs/nuxt-module)

- ⚡️ [Vite](https://github.com/vitejs/vite), [pnpm](https://pnpm.io/), [ESBuild](https://github.com/evanw/esbuild) - born with fastness

- 🍍 [State Management via Pinia](https://pinia.vuejs.org/)

- 📥 APIs auto importing - for Composition API, VueUse and custom composables

- ☁️ Deploy on [Netlify](https://www.netlify.com/), zero-config

- 🦾 TypeScript 100%

- 🧪 Unit, Component and E2E Testing with [@nuxt/test-utils](https://github.com/nuxt/test-utils)

<br>

### Admin Starter Template

- 🪟 Default layout with drawer, header and footer

- 🧭 Auto-generated navigation drawer and breadcrumbs based on routes

- 🔔 Notification store

- 📉 Data visualization with [nuxt-echarts](https://github.com/kingyue737/nuxt-echarts)

- 🎨 Theme color customization and dark mode

- 📱 Responsive layout

- 🛡️ Authentication backed-in using [nuxt-auth-utils](https://github.com/Atinux/nuxt-auth-utils)

## Variants

- [BroWorld repository](https://github.com/rami-aouinti/platform-nuxt)

## Pre-packed

### Nuxt Modules

- [Vuetify Nuxt Module](https://github.com/vuetifyjs/nuxt-module) - Zero-config Nuxt Module for Vuetify
- [VueUse](https://github.com/vueuse/vueuse) - Collection of useful composition APIs
- [Pinia](https://github.com/vuejs/pinia) - Intuitive, type-safe, light and flexible Store for Vue
- [Nuxt Icon](https://github.com/nuxt/icon) - Icon module for Nuxt with 200,000+ ready to use icons from Iconify
- [Nuxt ECharts](https://github.com/kingyue737/nuxt-echarts) - Nuxt module for Apache ECharts™
- [Nuxt Auth Utils](https://github.com/Atinux/nuxt-auth-utils) - Minimalist Authentication module for Nuxt

### Coding Style

- [Prettier](https://prettier.io/), single quotes, no semi
- [ESLint flat config](https://eslint.org/docs/latest/use/configure/configuration-files-new) with adapted [@nuxt/eslint](https://github.com/nuxt/eslint), future-proof

### Dev tools

- [TypeScript](https://www.typescriptlang.org/)
- [pnpm](https://pnpm.js.org/) - Fast, disk space efficient package manager
- [Netlify](https://www.netlify.com/) - zero-config deployment
- [VS Code Extensions](./.vscode/extensions.json)
  - [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - TypeScript support inside Vue SFCs
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - Find and fix problems in your code
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - Code formatter
  - [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)

## Try it now!

### GitHub Template

[Repository on GitHub](https://github.com/rami-aouinti/platform-nuxt).

### Clone to local

If you prefer to do it manually with the cleaner git history

```bash
git clone https://github.com/rami-aouinti/platform-nuxt
cd platform-nuxt
pnpm i
```

### Authentication Setup

> You can switch to any [OAuth Providers](https://github.com/Atinux/nuxt-auth-utils#supported-oauth-providers) supported by [Nuxt Auth Utils](https://github.com/Atinux/nuxt-auth-utils) or write your own.

Create a [GitHub OAuth Application](https://github.com/settings/applications/new) with:

- Homepage url: `http://localhost:3000`
- Callback url: `http://localhost:3000/api/auth/github`

Add the variables in the `.env` file:

```bash
NUXT_OAUTH_GITHUB_CLIENT_ID="my-github-oauth-app-id"
NUXT_OAUTH_GITHUB_CLIENT_SECRET="my-github-oauth-app-secret"
```

To create sealed sessions, you also need to add `NUXT_SESSION_SECRET` in the `.env` with at least 32 characters:

```bash
NUXT_SESSION_SECRET=your-super-long-secret-for-session-encryption
```

Nuxt Auth Utils generates one for you when running Nuxt in development the first time if no `NUXT_SESSION_PASSWORD` is set.

### Redis Cache Setup (Profile Endpoints)

Le cache des endpoints `profile` côté serveur utilise Redis. Ajoutez les variables suivantes dans votre `.env`:

```bash
NUXT_PROFILE_ENDPOINT_CACHE_TTL_MS=30000
NUXT_REDIS_URL=redis://localhost:6379
# ou configuration détaillée
NUXT_REDIS_HOST=localhost
NUXT_REDIS_PORT=6379
NUXT_REDIS_PASSWORD=""
```

Notes:

- `NUXT_PROFILE_ENDPOINT_CACHE_TTL_MS` est exprimé en millisecondes.
- Utilisez `NUXT_REDIS_URL` **ou** le triplet host/port/password.
- Si Redis n'est pas configuré ou indisponible, le fallback est sans crash (cache ignoré).

Convention de clés Redis (documentée):

- **Namespace domaine**: `profile:`, `auth:`, `admin:`.
- **Version de schéma**: `v1` est incluse dans chaque clé (`<namespace>:v1:...`) pour faciliter les migrations futures.
- **Scopes métier**: les clés sont enrichies avec des segments de scope (`user`, `company`, `role`, `group`) via les identifiants disponibles (`x-user-id`, `x-company-id`, etc.).
- Exemple de format: `profile:v1:auth:<hash>:user:<userId>:company:<companyId>:role:<roleId>:group:<groupId>:resource:<endpoint>`.

Invalidation ciblée:

- Les mutations admin `PATCH/PUT/DELETE` sur `user`, `role` et `user_group` déclenchent une invalidation Redis ciblée par scope.
- L'invalidation est exécutée **après succès** de la mutation upstream.

Observabilité cache:

- Logs/metrics minimaux ajoutés côté serveur pour suivre `hit`, `miss` et `error`.

### Development

Start the development server on http://localhost:3000

```bash
pnpm run dev
```

## License

[MIT License](./LICENSE)

## UI Wrappers (`app/components/ui`)

Des composants wrappers sont disponibles pour homogénéiser l'usage de Vuetify:

- `UiButton` (wrap `v-btn`)
- `UiCard` (wrap `v-card`)
- `UiAvatar` (wrap `v-avatar`)

### Props communes

- `size`: `xs | sm | md | lg | xl` (mappé vers les tailles Vuetify selon le composant)
- `rounded`: `boolean | sm | md | lg | xl | pill`
- `elevation`: `number`
- `color`: `string`
- `shadow`: `none | sm | md | lg | xl` (mappé en classes CSS)

### Props spécifiques

- `UiButton`: `variant`, `disabled`, `loading`, `icon`, `to`, `href`
- `UiCard`: `variant`, `border`
- `UiAvatar`: `icon`, `image`

### Exemples

```vue
<UiButton color="primary" size="lg" rounded="pill" shadow="md" variant="flat">
  Enregistrer
</UiButton>

<UiCard color="surface" rounded="xl" elevation="2" shadow="lg" border>
  <template #default>Contenu de la carte</template>
</UiCard>

<UiAvatar size="lg" color="primary" icon="mdi-account" shadow="sm" />
<UiAvatar size="40" image="https://i.pravatar.cc/80" rounded="sm" />
```

Les slots et attributs supplémentaires sont passés au composant Vuetify via `$attrs` et slot forwarding.

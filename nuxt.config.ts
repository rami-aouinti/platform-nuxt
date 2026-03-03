import { vuetifyMdiAliases } from './app/utils/vuetifyMdiAliases'

const legacyInternalPageMatchers = [
  '/legacy/Components/',
  '/legacy/Layout/',
  '/legacy/Tables/Tables/',
  '/legacy/Widgets/',
]

const shouldExcludeLegacyInternalPage = (file: string) =>
  legacyInternalPageMatchers.some((segment) => file.includes(segment))

const filterLegacyInternalPages = (
  pages: Array<{ file?: string; children?: any[] }>,
) => {
  for (let index = pages.length - 1; index >= 0; index -= 1) {
    const page = pages[index]

    if (page.children?.length) {
      filterLegacyInternalPages(page.children)
    }

    if (page.file && shouldExcludeLegacyInternalPage(page.file)) {
      pages.splice(index, 1)
    }
  }
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  routeRules: {
    '/jobs': { redirect: { to: '/offers', statusCode: 301 } },
    '/jobs/my-offers': {
      redirect: { to: '/offers/my-offers', statusCode: 301 },
    },
    '/jobs/applications': {
      redirect: { to: '/offers/my-applications', statusCode: 301 },
    },
    '/administration': { redirect: { to: '/admin', statusCode: 301 } },
    '/administration/**': {
      redirect: {
        to: '/admin/**',
        statusCode: 301,
      },
    },
  },
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'vuetify-nuxt-module',
    '@nuxtjs/i18n',
    'nuxt-auth-utils',
    'nuxt-echarts',
    '@nuxt/icon',
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
  ],

  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
    lazy: true,
    langDir: 'locales/',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'de', name: 'Deutsch', file: 'de.json' },
      { code: 'fr', name: 'Français', file: 'fr.json' },
    ],
  },
  pinia: {
    storesDirs: ['./app/stores/**'],
  },
  css: ['~/assets/styles/index.css', '~/assets/styles/material-dashboard.scss'],
  experimental: { typedPages: true },
  typescript: {
    shim: false,
    strict: true,
    tsConfig: {
      include: ['../test/**/*.ts'],
    },
  },
  vue: { propsDestructure: true },
  vueuse: { ssrHandlers: true },
  vuetify: {
    moduleOptions: {
      ssrClientHints: {
        viewportSize: true,
        prefersColorScheme: true,
        prefersColorSchemeOptions: {},
        reloadOnFirstRequest: true,
      },
    },
  },
  icon: {
    clientBundle: {
      icons: Object.values(vuetifyMdiAliases).map((v) =>
        (v as string).replace(/^mdi-/, 'mdi:'),
      ),
      scan: true,
    },
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons',
      },
    ],
  },
  echarts: {
    charts: ['LineChart', 'BarChart', 'PieChart', 'RadarChart'],
    renderer: 'svg',
    components: [
      'DataZoomComponent',
      'LegendComponent',
      'TooltipComponent',
      'ToolboxComponent',
      'GridComponent',
      'TitleComponent',
      'DatasetComponent',
      'VisualMapComponent',
    ],
  },
  vite: {
    resolve: {
      alias: [
        { find: 'chart.js/auto', replacement: './app/shims/chartjs-auto.ts' },
        { find: 'sweetalert2', replacement: './app/shims/sweetalert2.ts' },
        {
          find: 'vue-sweetalert2',
          replacement: './app/shims/vue-sweetalert2.ts',
        },
        {
          find: /^jsvectormap$/,
          replacement: './app/shims/jsvectormap/index.ts',
        },
        {
          find: 'jsvectormap/dist/maps/world.js',
          replacement: './app/shims/jsvectormap-world.ts',
        },
        {
          find: 'jsvectormap/dist/maps/world-merc',
          replacement: './app/shims/jsvectormap-world-merc.ts',
        },
        {
          find: 'jsvectormap/dist/css/jsvectormap.min.css',
          replacement: './app/shims/jsvectormap.min.css',
        },
        { find: /^jsvectormap\//, replacement: './app/shims/jsvectormap/' },
        { find: /^leaflet$/, replacement: './app/shims/leaflet/index.ts' },
        {
          find: 'leaflet/dist/leaflet.css',
          replacement: './app/shims/leaflet.css',
        },
        { find: /^leaflet\//, replacement: './app/shims/leaflet/' },
        { find: 'vue2-leaflet', replacement: './app/shims/vue2-leaflet.ts' },
        {
          find: /^vue-kanban$/,
          replacement: './app/shims/vue-kanban/index.ts',
        },
        { find: /^vue-kanban\//, replacement: './app/shims/vue-kanban/' },
        { find: /^quill$/, replacement: './app/shims/quill/index.ts' },
        {
          find: 'quill/dist/quill.snow.css',
          replacement: './app/shims/quill.snow.css',
        },
        { find: /^quill\//, replacement: './app/shims/quill/' },
        { find: /^dropzone$/, replacement: './app/shims/dropzone/index.ts' },
        { find: 'vue-pswipe', replacement: './app/shims/vue-pswipe.ts' },
        {
          find: 'vue-round-slider',
          replacement: './app/shims/vue-round-slider.ts',
        },
      ],
    },
    build: { sourcemap: false },
  },
  runtimeConfig: {
    github: {
      clientId: '',
      clientSecret: '',
    },
    session: {
      name: 'nuxt-session',
      password: '',
    },
    authApiBase: '',
    authApiTimeoutMs: 8000,
    mercurePublicUrl: '',
    profileEndpointCacheTtlMs: 30000,
    redisUrl: '',
    redisHost: '',
    redisPort: 6379,
    redisPassword: '',
    apiVersionProxy: {
      v1: '/api/v1',
      v2: '/api/v2',
    },
    public: {
      authApiBase: 'https://bro-world.org',
      mercurePublicUrl: 'https://bro-world.org/.well-known/mercure',
    },
  },
  compatibilityDate: '2024-08-05',
  hooks: {
    'pages:extend'(pages) {
      filterLegacyInternalPages(pages)
    },
  },
})

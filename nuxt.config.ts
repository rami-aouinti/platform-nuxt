import { vuetifyMdiAliases } from './app/utils/vuetifyMdiAliases'
import { defineNuxtConfig } from 'nuxt/config'

const legacyInternalPageMatchers = [
  '/legacy/Components/',
  '/legacy/Layout/',
  '/legacy/Tables/Tables/',
  '/legacy/Widgets/',
]

const shouldExcludeLegacyInternalPage = (file: string) =>
  legacyInternalPageMatchers.some((segment) => file.includes(segment))

const filterLegacyInternalPages = (pages: Array<{ file?: string; children?: any[] }>) => {
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
    public: {
      authApiBase: 'http://localhost',
    },
  },
  compatibilityDate: '2024-08-05',
  hooks: {
    'pages:extend'(pages) {
      filterLegacyInternalPages(pages)
    },
  },
})

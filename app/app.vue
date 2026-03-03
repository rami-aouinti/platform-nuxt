<script setup lang="ts">
const theme = useTheme()
provide(
  THEME_KEY,
  computed(() => (theme.current.value.dark ? 'dark' : undefined)),
)

const route = useRoute()
const requestUrl = useRequestURL()
const runtimeConfig = useRuntimeConfig()
const { locale } = useI18n()

const defaultTitle = 'Bro World'
const defaultDescription = 'Bro World platform'
const defaultKeywords = 'bro world, jobs, recruitment, crm'
const defaultOgImage = '/social-image.png'
const siteName = 'Bro World'
const publicSiteUrl = runtimeConfig.public.authApiBase || requestUrl.origin

const resolvedSeoMeta = computed(() => {
  const title =
    String(route.meta?.title || route.matched[0]?.meta?.title || '').trim() ||
    defaultTitle

  return {
    title,
    description:
      String(route.meta?.description || '').trim() || defaultDescription,
    keywords: String(route.meta?.keywords || '').trim() || defaultKeywords,
    image: String(route.meta?.image || '').trim() || defaultOgImage,
  }
})

const canonicalUrl = computed(() => {
  const path = route.fullPath || '/'
  return new URL(path, publicSiteUrl).toString()
})

const themeColor = computed(() =>
  theme.current.value.dark ? '#121212' : '#ffffff',
)

const seoMetaPayload = computed(() => ({
  title: resolvedSeoMeta.value.title,
  description: resolvedSeoMeta.value.description,
  author: 'rami.aouinti@gmail.com',
  ogTitle: resolvedSeoMeta.value.title,
  ogDescription: resolvedSeoMeta.value.description,
  ogType: 'website',
  ogUrl: canonicalUrl.value,
  ogImage: resolvedSeoMeta.value.image,
  twitterTitle: resolvedSeoMeta.value.title,
  twitterDescription: resolvedSeoMeta.value.description,
  twitterImage: resolvedSeoMeta.value.image,
  twitterCard: 'summary_large_image',
  keywords: resolvedSeoMeta.value.keywords,
  themeColor: themeColor.value,
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  ogLocale: locale.value,
  ogSiteName: siteName,
}))

useHead({
  title: computed(() => resolvedSeoMeta.value.title),
  titleTemplate: (t) => (t ? `${t} | ${siteName}` : siteName),
  htmlAttrs: { lang: computed(() => locale.value) },
  link: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'canonical', href: computed(() => canonicalUrl.value) },
  ],
})

useSeoMeta(() => seoMetaPayload.value)
</script>

<template>
  <v-app>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

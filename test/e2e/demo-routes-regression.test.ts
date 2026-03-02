import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

await setup({
  rootDir: fileURLToPath(new URL('../', import.meta.url)),
})

describe('demo routes regression', () => {
  it('does not expose the removed /auth demo page', async () => {
    const response = await $fetch.raw('/auth', {
      responseType: 'text',
      ignoreResponseError: true,
    })

    expect(response.status).toBe(404)
    expect(response._data).toContain('Whoops, 404')
  })
})

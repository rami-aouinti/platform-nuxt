import { fileURLToPath } from 'node:url'
import { createServer } from 'node:http'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

let upstreamBaseURL = ''
let upstreamServer: ReturnType<typeof createServer>

beforeAll(async () => {
  upstreamServer = createServer((req, res) => {
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ path: req.url }))
  })

  await new Promise<void>((resolve) => {
    upstreamServer.listen(0, '127.0.0.1', () => {
      const address = upstreamServer.address()
      if (!address || typeof address === 'string') {
        throw new Error('Unable to start upstream test server.')
      }
      upstreamBaseURL = `http://127.0.0.1:${address.port}`
      process.env.NUXT_AUTH_API_BASE = upstreamBaseURL
      process.env.NUXT_PUBLIC_AUTH_API_BASE = upstreamBaseURL
      resolve()
    })
  })
})

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    upstreamServer.close((error) => {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })
})

await setup({
  rootDir: fileURLToPath(new URL('../', import.meta.url)),
})

describe('role routing', () => {
  it('resolves static /api/role/count before dynamic route', async () => {
    const response = await $fetch<{ path: string }>('/api/role/count')

    expect(response.path).toBe('/api/v1/role/count')
  })

  it('resolves static /api/role/ids before dynamic route', async () => {
    const response = await $fetch<{ path: string }>('/api/role/ids')

    expect(response.path).toBe('/api/v1/role/ids')
  })

  it('resolves /api/role/{validRole} via dynamic route', async () => {
    const response = await $fetch<{ path: string }>('/api/role/admin')

    expect(response.path).toBe('/api/v1/role/admin')
  })
})

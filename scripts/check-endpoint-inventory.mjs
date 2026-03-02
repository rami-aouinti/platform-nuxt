import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SCAN_DIRS = ['app', 'services', 'server/api']
const FILE_EXTENSIONS = new Set(['.ts', '.js', '.mjs', '.vue'])

function normalizeEndpoint(endpoint) {
  return endpoint
    .replace(/\$\{[^}]+\}/g, ':param')
    .replace(/\/:param\/:param/g, '/:param/:param')
    .replace(/([a-z0-9-]):param/gi, '$1/:param')
}


const CONVENTION_RE = /^\/api(?:\/(?:v\d+|[a-z0-9][a-z0-9-]*))(?:\/[a-zA-Z0-9._:[\]-]+)*$/

async function walk(dir) {
  const fullDir = path.join(ROOT, dir)
  const output = []
  const entries = await fs.readdir(fullDir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(fullDir, entry.name)
    if (entry.isDirectory()) {
      output.push(...await walk(path.join(dir, entry.name)))
      continue
    }

    if (FILE_EXTENSIONS.has(path.extname(entry.name))) {
      output.push(path.join(dir, entry.name))
    }
  }

  return output
}

async function collectEndpoints() {
  const endpoints = new Map()

  for (const dir of SCAN_DIRS) {
    const files = await walk(dir)

    for (const file of files) {
      const content = await fs.readFile(path.join(ROOT, file), 'utf8')
      const matches = content.matchAll(/["'`](\/api(?:\/[^"'`\s]*)?)["'`]/g)

      for (const match of matches) {
        const rawEndpoint = match[1]
        if (!rawEndpoint || rawEndpoint === '/api') continue
        const endpoint = normalizeEndpoint(rawEndpoint)

        if (!endpoints.has(endpoint)) endpoints.set(endpoint, [])
        endpoints.get(endpoint).push(file)
      }
    }
  }

  return endpoints
}

async function main() {
  const endpoints = await collectEndpoints()
  const inventory = JSON.parse(
    await fs.readFile(path.join(ROOT, 'docs/endpoint-inventory.registry.json'), 'utf8'),
  )

  const inventoryMap = new Map(inventory.map((entry) => [entry.endpoint, entry]))
  const allowed = new Set(inventoryMap.keys())

  const invalidConvention = [...endpoints.entries()].filter(([endpoint]) => !CONVENTION_RE.test(endpoint) && !inventoryMap.get(endpoint)?.allowNonConvention)
  const missingFromInventory = [...endpoints.entries()].filter(([endpoint]) => !allowed.has(endpoint))

  if (invalidConvention.length || missingFromInventory.length) {
    if (invalidConvention.length) {
      console.error('\n[endpoint-inventory] Endpoints hors convention:')
      for (const [endpoint, files] of invalidConvention) {
        console.error(`- ${endpoint} (ex: ${files[0]})`)
      }
    }

    if (missingFromInventory.length) {
      console.error('\n[endpoint-inventory] Endpoints non enregistrés dans docs/endpoint-inventory.registry.json:')
      for (const [endpoint, files] of missingFromInventory) {
        console.error(`- ${endpoint} (ex: ${files[0]})`)
      }
    }

    process.exit(1)
  }

  console.log(`[endpoint-inventory] OK: ${endpoints.size} endpoints conformes et enregistrés.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

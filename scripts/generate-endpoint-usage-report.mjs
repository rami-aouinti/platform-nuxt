import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SCAN_DIRS = ['app', 'services', 'server/api']
const FILE_EXTENSIONS = new Set(['.ts', '.js', '.mjs', '.vue'])

const BUSINESS_ENDPOINT_MAPPING = [
  ['/api/v1/job-offers', '/api/job-offers'],
  ['/api/v1/job-offers/:id', '/api/job-offers/:id'],
  ['/api/v1/job-offers/available', '/api/job-offers/available'],
  ['/api/v1/job-offers/my', '/api/job-offers/my'],
  ['/api/v1/job-offers/:id/apply', '/api/job-offers/:id/apply'],
  ['/api/v1/job-applications', '/api/job-applications'],
  ['/api/v1/job-applications/:id', '/api/job-applications/:id'],
  ['/api/v1/job-applications/:id/accept', '/api/job-applications/:id/accept'],
  ['/api/v1/job-applications/:id/reject', '/api/job-applications/:id/reject'],
  ['/api/v1/job-applications/:id/withdraw', '/api/job-applications/:id/withdraw'],
  ['/api/v1/companies', '/api/companies'],
  ['/api/v1/companies/:id', '/api/companies/:id'],
  ['/api/v1/companies/:id/members', '/api/companies/:id/members'],
  ['/api/v1/notifications', '/api/notifications'],
  ['/api/v1/notifications/:id', '/api/notifications/:id'],
  ['/api/v1/notifications/:id/read', '/api/notifications/:id/read'],
  ['/api/v1/notifications/read-all', '/api/notifications/read-all'],
  ['/api/v1/notifications/unread-count', '/api/notifications/unread-count'],
  ['/api/v1/profile', '/api/v1/me/profile'],
  ['/api/profile', '/api/v1/me/profile'],
  ['/api/v1/profile/roles', '/api/v1/me/profile/roles'],
  ['/api/profile/roles', '/api/v1/me/profile/roles'],
  ['/api/v1/profile/groups', '/api/v1/me/profile/groups'],
  ['/api/profile/groups', '/api/v1/me/profile/groups'],
]

const DEPRECATED_TO_REPLACEMENT = new Map(BUSINESS_ENDPOINT_MAPPING)

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

function endpointToPattern(endpoint) {
  return endpoint
    .replace(/\/\[[^/]+\]/g, ':id')
    .replace(/\/\d+(?=\/|$)/g, ':id')
}

function classify(endpoint) {
  const normalized = endpointToPattern(endpoint)
  const replacement = DEPRECATED_TO_REPLACEMENT.get(normalized)

  if (replacement) {
    return {
      status: 'deprecated',
      decision: 'Fusionné',
      replacement,
      migration: {
        replacementEndpoint: replacement,
        frontendImpact: 'Mettre à jour les appels front/services vers le endpoint remplaçant.',
        rollback: `Conserver un fallback temporaire vers ${normalized} derrière un flag serveur.`,
      },
    }
  }

  return {
    status: 'active',
    decision: 'Conservé',
    replacement: null,
    migration: null,
  }
}

async function collectUsage() {
  const usage = []
  for (const dir of SCAN_DIRS) {
    const files = await walk(dir)
    for (const file of files) {
      const content = await fs.readFile(path.join(ROOT, file), 'utf8')
      const matches = content.matchAll(/["'`](\/api(?:\/[^"'`\s]*)?)["'`]/g)
      for (const match of matches) {
        const rawEndpoint = match[1]
        if (!rawEndpoint || rawEndpoint === '/api') continue
        const endpoint = normalizeEndpoint(rawEndpoint)

        const type = file.startsWith('server/api/') ? 'proxy' : 'direct'
        const { status, decision, replacement, migration } = classify(endpoint)

        usage.push({ endpoint, file, type, status, decision, replacement, migration })
      }
    }
  }

  usage.sort((a, b) => a.endpoint.localeCompare(b.endpoint) || a.file.localeCompare(b.file))
  return usage
}

function uniqByEndpoint(usage) {
  const map = new Map()
  for (const row of usage) {
    const existing = map.get(row.endpoint)
    if (!existing) {
      map.set(row.endpoint, {
        endpoint: row.endpoint,
        status: row.status,
        decision: row.decision,
        replacement: row.replacement,
        allowNonConvention: !CONVENTION_RE.test(row.endpoint),
      })
      continue
    }

    if (existing.status !== 'deprecated' && row.status === 'deprecated') {
      existing.status = row.status
      existing.decision = row.decision
      existing.replacement = row.replacement
    }
  }
  return [...map.values()].sort((a, b) => a.endpoint.localeCompare(b.endpoint))
}

function toMarkdown(usage) {
  const header = '# Endpoint usage inventory\n\n'
    + 'Source: scan automatique des chemins `app/**`, `services/**`, `server/api/**` + croisement avec la liste métier de `docs/legacy-upstream-endpoints-mapping.md` et `docs/canonical-vs-deprecated-endpoints.md`.\n\n'

  const usageTable = [
    '| Endpoint | Fichier appelant | Type | Statut |',
    '| --- | --- | --- | --- |',
    ...usage.map((row) => `| \`${row.endpoint}\` | \`${row.file}\` | ${row.type} | ${row.status} |`),
  ].join('\n')

  const decisions = uniqByEndpoint(usage)
  const decisionTable = [
    '| Endpoint | Classification métier | Endpoint cible |',
    '| --- | --- | --- |',
    ...decisions.map((row) => `| \`${row.endpoint}\` | ${row.decision} | ${row.replacement ? `\`${row.replacement}\`` : '—'} |`),
  ].join('\n')

  const deprecated = usage.filter((row) => row.status === 'deprecated')
  const deprecatedByEndpoint = new Map()
  for (const row of deprecated) {
    if (!deprecatedByEndpoint.has(row.endpoint)) deprecatedByEndpoint.set(row.endpoint, row)
  }

  const migrationRows = [...deprecatedByEndpoint.values()].map((row) =>
    `| \`${row.endpoint}\` | \`${row.migration.replacementEndpoint}\` | ${row.migration.frontendImpact} | ${row.migration.rollback} |`,
  )

  const migrationTable = [
    '| Endpoint à supprimer | Endpoint remplaçant | Impacts front | Rollback |',
    '| --- | --- | --- | --- |',
    ...migrationRows,
  ].join('\n')

  const cleanupSection = [
    '## 5) Nettoyage post-migration',
    '',
    '- Routes serveur et services front actuellement référencés par l\'inventaire: **conservés**.',
    '- Suppression automatique conditionnée à un inventaire vide de références en CI (`endpoint:inventory:check`).',
    '- Documentation nettoyée: ce document devient la source d\'inventaire unique.',
  ].join('\n')

  return `${header}## 1) Endpoint usage\n\n${usageTable}\n\n## 2) Classification métier\n\n${decisionTable}\n\n## 3) Plan de migration des endpoints supprimés\n\n${migrationTable}\n\n## 4) Règle CI\n\n- Validation via \`scripts/check-endpoint-inventory.mjs\`: bloque les endpoints hors convention (sauf allow-list legacy) et ceux non enregistrés.\n- Job CI ajouté pour exécuter \`pnpm run endpoint:inventory:check\`.\n\n${cleanupSection}\n`
}

async function main() {
  const usage = await collectUsage()
  const registry = uniqByEndpoint(usage)

  await fs.writeFile(path.join(ROOT, 'docs/endpoint-inventory.registry.json'), `${JSON.stringify(registry, null, 2)}\n`)
  await fs.writeFile(path.join(ROOT, 'docs/endpoint-usage-inventory.md'), toMarkdown(usage))

  const invalid = registry.filter((row) => row.allowNonConvention)
  if (invalid.length) {
    console.warn('[endpoint-inventory] Endpoints hors convention autorisés (legacy):', invalid.map((v) => v.endpoint).join(', '))
  }

  console.log(`[endpoint-inventory] Generated ${usage.length} usages, ${registry.length} endpoints uniques.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

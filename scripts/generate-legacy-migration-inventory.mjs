import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { extname, join, relative, sep } from 'node:path'

const LEGACY_ROOT = 'app/pages/legacy'
const OUTPUT_DIR = 'docs/legacy-migration'
const CSV_OUTPUT = join(OUTPUT_DIR, 'legacy-pages-inventory.csv')
const MD_OUTPUT = join(OUTPUT_DIR, 'legacy-pages-backlog.md')

const ROOT_ORDER = ['Dashboard', 'Pages', 'Ecommerce', 'Applications', 'Tables', 'Layout', 'Components']

function toKebabCase(value) {
  return value
    .replace(/\.vue$/i, '')
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
}

function walkVueFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkVueFiles(fullPath))
      continue
    }

    if (entry.isFile() && extname(entry.name) === '.vue') {
      files.push(fullPath)
    }
  }

  return files
}

function extractUiDependencies(filePath) {
  const content = readFileSync(filePath, 'utf8')
  const importRegex = /^\s*import\s+[^'"`]*['"]([^'"`]+)['"]/gm
  const deps = new Set()
  let match

  while ((match = importRegex.exec(content)) !== null) {
    const specifier = match[1]
    if (
      specifier.includes('components') ||
      specifier.startsWith('vuetify') ||
      specifier.startsWith('@fullcalendar') ||
      specifier.startsWith('echarts')
    ) {
      deps.add(specifier)
    }
  }

  if (deps.size === 0) {
    return 'none'
  }

  return [...deps].sort().join('; ')
}

function computeRecord(filePath, index) {
  const relativeFile = relative(LEGACY_ROOT, filePath).split(sep).join('/')
  const segments = relativeFile.replace(/\.vue$/i, '').split('/')
  const domain = segments[0]
  const legacyRoute = `/legacy/${segments.join('/')}`

  const targetSegments = segments.map((segment, segmentIndex) => {
    if (segmentIndex === 0) {
      return toKebabCase(segment)
    }

    return toKebabCase(segment)
  })

  const targetRoute = `/${targetSegments.join('/')}`
  const ticketNumber = String(index + 1).padStart(4, '0')

  return {
    legacy_file: `${LEGACY_ROOT}/${relativeFile}`,
    legacy_route: legacyRoute,
    domain,
    ui_dependencies: extractUiDependencies(filePath),
    migration_status: 'not started',
    target_nuxt4_route: targetRoute,
    migration_ticket: `MIG-${ticketNumber}`,
    ux_validation_ticket: `UX-${ticketNumber}`,
    migration_flag: 'pending',
  }
}

function csvEscape(value) {
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replaceAll('"', '""')}"`
  }

  return stringValue
}

mkdirSync(OUTPUT_DIR, { recursive: true })

const vueFiles = walkVueFiles(LEGACY_ROOT)
  .map((filePath) => filePath.split(sep).join('/'))
  .sort((a, b) => a.localeCompare(b))

const records = vueFiles.map((filePath, index) => computeRecord(filePath, index))

const header = [
  'legacy_file',
  'legacy_route',
  'domain',
  'ui_dependencies',
  'migration_status',
  'target_nuxt4_route',
  'migration_ticket',
  'ux_validation_ticket',
  'migration_flag',
]

const csvLines = [header.join(',')]
for (const record of records) {
  csvLines.push(header.map((key) => csvEscape(record[key])).join(','))
}
writeFileSync(CSV_OUTPUT, `${csvLines.join('\n')}\n`)

const grouped = new Map(ROOT_ORDER.map((root) => [root, []]))
for (const record of records) {
  if (!grouped.has(record.domain)) {
    grouped.set(record.domain, [])
  }

  grouped.get(record.domain).push(record)
}

const mdSections = [
  '# Legacy migration backlog',
  '',
  'Generated from `app/pages/legacy/**/*.vue`.',
  '',
  '## Conventions de destination',
  '',
  '- Déplacer les pages vers `app/pages/<domain>/...` en supprimant le préfixe `legacy`.',
  '- Normaliser les chemins de destination en kebab-case.',
  '- Mettre à jour la colonne `migration_status` (`not started`, `in progress`, `done`) et `migration_flag` (`pending`, `migrated`).',
  '- `migration_ticket` couvre la migration technique, `ux_validation_ticket` couvre la validation UX post-migration.',
  '',
  '## Redirections HTTP',
  '',
  '- Utiliser **302** pendant la phase de migration tant que la nouvelle route n\'est pas validée.',
  '- Basculer en **301** quand la route Nuxt 4 est en production et validée UX.',
  '- Retirer les redirections temporaires une fois les liens internes mis à jour.',
  '',
]

for (const root of ROOT_ORDER) {
  const items = grouped.get(root) ?? []
  mdSections.push(`## ${root}`)
  mdSections.push('')
  if (items.length === 0) {
    mdSections.push('_Aucune page legacy détectée._')
    mdSections.push('')
    continue
  }

  mdSections.push('| Legacy route | Domaine | Dépendances UI | État migration | Route cible Nuxt 4 | Ticket migration | Ticket validation UX | Migration flag |')
  mdSections.push('| --- | --- | --- | --- | --- | --- | --- | --- |')

  for (const item of items) {
    mdSections.push(`| ${item.legacy_route} | ${item.domain} | ${item.ui_dependencies} | ${item.migration_status} | ${item.target_nuxt4_route} | ${item.migration_ticket} | ${item.ux_validation_ticket} | ${item.migration_flag} |`)
  }

  mdSections.push('')
}

writeFileSync(MD_OUTPUT, `${mdSections.join('\n')}\n`)

console.log(`Generated ${records.length} legacy page records.`)
console.log(`- ${CSV_OUTPUT}`)
console.log(`- ${MD_OUTPUT}`)

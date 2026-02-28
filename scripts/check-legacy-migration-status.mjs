import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative, sep } from 'node:path'

const LEGACY_ROOT = 'app/pages/legacy'
const INVENTORY_CSV = 'docs/legacy-migration/legacy-pages-inventory.csv'

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

function parseCsv(content) {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i]
    const next = content[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"'
        i += 1
      } else if (char === '"') {
        inQuotes = false
      } else {
        cell += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(cell)
      cell = ''
    } else if (char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (char === '\r') {
      continue
    } else {
      cell += char
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows.filter((r) => r.some((value) => value.trim() !== ''))
}

const csv = readFileSync(INVENTORY_CSV, 'utf8')
const rows = parseCsv(csv)
if (rows.length < 2) {
  console.error(`Inventory file is empty: ${INVENTORY_CSV}`)
  process.exit(1)
}

const header = rows[0]
const records = rows.slice(1)
const legacyFileIndex = header.indexOf('legacy_file')
const flagIndex = header.indexOf('migration_flag')

if (legacyFileIndex === -1 || flagIndex === -1) {
  console.error('Inventory CSV must contain `legacy_file` and `migration_flag` columns.')
  process.exit(1)
}

const statusByFile = new Map()
for (const record of records) {
  const file = record[legacyFileIndex]
  const flag = (record[flagIndex] ?? '').trim().toLowerCase()
  statusByFile.set(file, flag)
}

const legacyFiles = walkVueFiles(LEGACY_ROOT)
  .map((filePath) => filePath.split(sep).join('/'))
  .sort((a, b) => a.localeCompare(b))

const missingInInventory = []
const notMigrated = []

for (const filePath of legacyFiles) {
  const relativeFile = relative('.', filePath).split(sep).join('/')
  if (!statusByFile.has(relativeFile)) {
    missingInInventory.push(relativeFile)
    continue
  }

  if (statusByFile.get(relativeFile) !== 'migrated') {
    notMigrated.push(relativeFile)
  }
}

if (missingInInventory.length > 0 || notMigrated.length > 0) {
  console.error('Legacy migration check failed.')

  if (missingInInventory.length > 0) {
    console.error('\nMissing inventory rows:')
    for (const file of missingInInventory) {
      console.error(`- ${file}`)
    }
  }

  if (notMigrated.length > 0) {
    console.error('\nPages not marked as migrated (migration_flag != "migrated"):')
    for (const file of notMigrated) {
      console.error(`- ${file}`)
    }
  }

  process.exit(1)
}

console.log('All legacy pages are marked as migrated in the inventory.')

import { readFile } from 'node:fs/promises'
import { execSync } from 'node:child_process'

const TARGET_GLOBS = [
  'app/**/*.ts',
  'app/**/*.vue',
  'services/**/*.ts',
  'server/api/**/*.ts',
]

const LEGACY_PATTERNS = [
  /['"]\/api\/admin\//,
  /['"]\/api\/user_group\b/,
  /['"]\/api\/role\b/,
  /['"]\/api\/user\b/,
  /['"]\/api\/(v1|v2)\/api_key\b/,
  /['"]\/api\/api_key\b/,
]

const ALLOWLIST = [
  'server/utils/admin-path-convention.ts',
  'server/middleware/admin-path-compat.ts',
]

const ALLOWED_LEGACY_DIRECTORIES = [
  'server/api/user/',
  'server/api/role/',
  'server/api/user_group/',
  'server/api/companies/',
  'server/api/candidates/',
  'server/api/job-offers/',
  'server/api/job-applications/',
  'server/api/notifications/',
  'server/api/api_key/',
]

function listFiles() {
  const output = execSync(
    `rg --files ${TARGET_GLOBS.map((glob) => `-g '${glob}'`).join(' ')}`,
    { encoding: 'utf8' },
  )

  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function isAllowlisted(filePath) {
  return ALLOWLIST.some((allowed) => filePath === allowed)
    || ALLOWED_LEGACY_DIRECTORIES.some((prefix) => filePath.startsWith(prefix))
}

const violations = []

for (const filePath of listFiles()) {
  if (isAllowlisted(filePath)) {
    continue
  }

  const source = await readFile(filePath, 'utf8')
  const lines = source.split('\n')

  lines.forEach((line, index) => {
    if (LEGACY_PATTERNS.some((pattern) => pattern.test(line))) {
      violations.push(`${filePath}:${index + 1}: ${line.trim()}`)
    }
  })
}

if (violations.length > 0) {
  console.error('Found non-conforming API paths. Expected admin paths to use /api/v1/admin/{resource}.')
  console.error(violations.join('\n'))
  process.exit(1)
}

console.log('Admin API path convention check passed.')

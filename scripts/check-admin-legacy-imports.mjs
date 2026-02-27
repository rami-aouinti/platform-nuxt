import { execSync } from 'node:child_process'

const legacySpecifiers = [
  'services/admin/_shared',
  'services/admin/pagination',
  'services/admin/apiKeys.shared',
  'services/admin/apiKeys.v1',
  'services/admin/apiKeys.v2',
  'services/admin/userGroups',
  'services/admin/candidates',
  'services/admin/companies',
  'services/admin/job-applications',
  'services/admin/job-offers',
  'services/admin/notifications',
  'services/admin/roles',
  'services/admin/users',
]

const globs = ['app', 'services', 'test']
const matches = []

for (const specifier of legacySpecifiers) {
  const cmd = `rg -n --glob '*.{ts,tsx,js,mjs,cjs,vue}' "${specifier}['\"]" ${globs.join(' ')}`
  try {
    const output = execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim()
    if (output) {
      matches.push(...output.split('\n'))
    }
  } catch (error) {
    const output = error.stdout?.toString().trim()
    if (output) {
      matches.push(...output.split('\n'))
    }
  }
}

if (matches.length > 0) {
  console.error('Legacy admin imports are forbidden. Use canonical `services/admin/<resource>/index` paths.')
  for (const line of [...new Set(matches)]) {
    console.error(`- ${line}`)
  }
  process.exit(1)
}

console.log('No legacy admin imports found.')

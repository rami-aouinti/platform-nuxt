import { readFile } from 'node:fs/promises'
import { access } from 'node:fs/promises'
import { constants } from 'node:fs'
import { execSync } from 'node:child_process'
import { basename } from 'node:path'

function listAdminParentPages() {
  const output = execSync("rg --files -g 'app/pages/admin/*.vue'", { encoding: 'utf8' })

  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK)
    return true
  }
  catch {
    return false
  }
}

const violations = []

for (const filePath of listAdminParentPages()) {
  const source = await readFile(filePath, 'utf8')

  if (!source.includes('<NuxtPage')) {
    continue
  }

  const segment = basename(filePath, '.vue')
  const nestedIndexPath = `app/pages/admin/${segment}/index.vue`

  if (!(await fileExists(nestedIndexPath))) {
    violations.push(`${filePath} renders <NuxtPage /> but ${nestedIndexPath} is missing.`)
  }
}

if (violations.length > 0) {
  console.error('Admin parent route check failed: parent pages rendering <NuxtPage /> must have a child index route.')
  console.error(violations.join('\n'))
  process.exit(1)
}

console.log('Admin parent route check passed.')

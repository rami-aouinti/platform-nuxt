import { existsSync, readdirSync } from 'node:fs'
import { extname, join } from 'node:path'

const LEGACY_ROOT = 'app/pages/legacy'

function countVueFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true })
  let count = 0

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      count += countVueFiles(fullPath)
      continue
    }

    if (entry.isFile() && extname(entry.name) === '.vue') {
      count += 1
    }
  }

  return count
}

const remaining = existsSync(LEGACY_ROOT) ? countVueFiles(LEGACY_ROOT) : 0

console.log(`legacy-pages-remaining=${remaining}`)

if (process.env.GITHUB_STEP_SUMMARY) {
  const summary = [
    '## Legacy migration KPI',
    '',
    `- legacy-pages-remaining: **${remaining}**`,
    '- Source: `app/pages/legacy/**/*.vue`',
  ].join('\n')

  await import('node:fs/promises').then(({ appendFile }) =>
    appendFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`),
  )
}

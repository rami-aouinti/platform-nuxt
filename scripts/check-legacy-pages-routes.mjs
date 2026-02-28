import fs from 'node:fs'
import { execSync } from 'node:child_process'

const legacyPageFiles = execSync("rg --files app/pages/legacy -g '*.vue'", {
  stdio: ['ignore', 'pipe', 'pipe'],
})
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean)

const forbiddenSegments = ['/Widgets/', '/Components/', '/Layout/', '/Tables/Tables/']
const invalidPaths = legacyPageFiles.filter((file) => forbiddenSegments.some((segment) => file.includes(segment)))

const missingMeta = legacyPageFiles.filter((file) => {
  const source = fs.readFileSync(file, 'utf8')
  return !source.includes('definePageMeta(')
})

if (invalidPaths.length > 0 || missingMeta.length > 0) {
  console.error('Legacy pages boundaries check failed.')

  if (invalidPaths.length > 0) {
    console.error('\nNon-routed components detected in app/pages/legacy:')
    for (const file of invalidPaths.sort()) {
      console.error(`- ${file}`)
    }
  }

  if (missingMeta.length > 0) {
    console.error('\nRoute pages missing definePageMeta:')
    for (const file of missingMeta.sort()) {
      console.error(`- ${file}`)
    }
  }

  process.exit(1)
}

console.log(`Legacy pages boundary check passed for ${legacyPageFiles.length} route files.`)

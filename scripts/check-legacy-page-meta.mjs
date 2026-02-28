import fs from 'node:fs'
import { execSync } from 'node:child_process'

const excludedSegments = ['/Widgets/', '/Layout/', '/Components/', '/Tables/Tables/']

const files = execSync("rg --files app/pages/legacy -g '*.vue'", {
  stdio: ['ignore', 'pipe', 'pipe'],
})
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean)

const routableLegacyPages = files.filter(
  (file) => !excludedSegments.some((segment) => file.includes(segment)),
)

const missingMeta = []
const missingLayout = []

for (const file of routableLegacyPages) {
  const source = fs.readFileSync(file, 'utf8')

  const definePageMetaIndex = source.indexOf('definePageMeta(')
  if (definePageMetaIndex === -1) {
    missingMeta.push(file)
    continue
  }

  const scriptSetupSection = source.match(/<script\s+setup[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptSetupSection) {
    missingMeta.push(`${file} (definePageMeta must be in <script setup>)`)
    continue
  }

  const metaBlock = scriptSetupSection[1].match(/definePageMeta\s*\((\{[\s\S]*?\})\s*\)/)
  if (!metaBlock) {
    missingMeta.push(`${file} (unable to parse definePageMeta object)`)
    continue
  }

  if (!/\blayout\s*:/.test(metaBlock[1])) {
    missingLayout.push(file)
  }
}

if (missingMeta.length > 0 || missingLayout.length > 0) {
  console.error('Legacy page meta check failed.')

  if (missingMeta.length > 0) {
    console.error('\nMissing definePageMeta in routable legacy pages:')
    for (const file of missingMeta.sort()) {
      console.error(`- ${file}`)
    }
  }

  if (missingLayout.length > 0) {
    console.error('\nMissing layout in definePageMeta for routable legacy pages:')
    for (const file of missingLayout.sort()) {
      console.error(`- ${file}`)
    }
  }

  process.exit(1)
}

console.log(`Legacy page meta check passed for ${routableLegacyPages.length} routable pages.`)

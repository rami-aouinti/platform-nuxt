import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const targetDirs = [
  join(process.cwd(), 'app/pages/offers'),
]
const allowList = [
  /^\s*[-–—:,.!?()\d]+\s*$/,
  /^\s*mdi-[a-z0-9-]+\s*$/,
]

const templateRegex = /<template>([\s\S]*?)<\/template>/g
const textNodeRegex = />([^<\n][^<]*?)</g
const attrRegex = /\s(?:title|label|description|subtitle|placeholder|action-label)="([^"]*[A-Za-zÀ-ÿ][^"]*)"/g

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) out.push(...walk(full))
    else if (extname(full) === '.vue') out.push(full)
  }
  return out
}

function isAllowed(text) {
  return allowList.some((r) => r.test(text))
}

const issues = []

for (const rootDir of targetDirs) {
for (const file of walk(rootDir)) {
  const source = readFileSync(file, 'utf8')
  const templates = [...source.matchAll(templateRegex)]
  for (const match of templates) {
    const tpl = match[1]

    for (const textMatch of tpl.matchAll(textNodeRegex)) {
      const raw = textMatch[1].trim()
      if (!raw) continue
      if (raw.includes('{{') || raw.includes('}}')) continue
      if (raw.startsWith('/')) continue
      if (isAllowed(raw)) continue
      if (!/[A-Za-zÀ-ÿ]/.test(raw)) continue
      issues.push(`${file}: hardcoded text node "${raw}"`)
    }

    for (const attrMatch of tpl.matchAll(attrRegex)) {
      const raw = attrMatch[1].trim()
      if (!raw) continue
      if (raw.includes('t(') || raw.includes('$t(')) continue
      if (isAllowed(raw)) continue
      issues.push(`${file}: hardcoded attribute text "${raw}"`)
    }
  }
}
}

if (issues.length) {
  console.error('Found hardcoded UI strings in templates:')
  for (const issue of issues) console.error(`- ${issue}`)
  process.exit(1)
}

console.log('No hardcoded UI strings found in app/pages templates.')

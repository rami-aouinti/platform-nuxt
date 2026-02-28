import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const repoRoot = process.cwd()
const files = execSync("rg --files app/pages/legacy -g '*.vue' -g '*.js'", {
  stdio: ['ignore', 'pipe', 'pipe'],
})
  .toString()
  .trim()
  .split('\n')
  .filter(Boolean)

const extensions = ['.vue', '.js', '.mjs', '.cjs', '.ts', '.mts', '.cts', '.jsx', '.tsx', '.json']

const findExistingModule = (resolvedPath) => {
  const statSafe = (target) => {
    try {
      return fs.statSync(target)
    } catch {
      return null
    }
  }

  const direct = statSafe(resolvedPath)
  if (direct?.isFile()) return resolvedPath

  for (const ext of extensions) {
    const candidate = `${resolvedPath}${ext}`
    if (statSafe(candidate)?.isFile()) return candidate
  }

  for (const ext of extensions) {
    const indexCandidate = path.join(resolvedPath, `index${ext}`)
    if (statSafe(indexCandidate)?.isFile()) return indexCandidate
  }

  return null
}

const resolveSpecifier = (specifier, sourceFile) => {
  if (specifier.startsWith('.')) {
    return findExistingModule(path.resolve(path.dirname(sourceFile), specifier))
  }

  if (specifier.startsWith('@/') || specifier.startsWith('~/')) {
    return findExistingModule(path.resolve(repoRoot, 'app', specifier.slice(2)))
  }

  return 'external'
}

const missing = []
const pattern = /(?:^|\n)\s*(?:import|export)\s+(?:[^'"\n]+?\s+from\s+)?['"]([^'"\n]+)['"]/g

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8')

  for (const match of source.matchAll(pattern)) {
    const specifier = match[1]

    if (specifier.startsWith('#')) continue

    const resolved = resolveSpecifier(specifier, path.resolve(repoRoot, file))

    if (!resolved) {
      missing.push(`${file}: ${specifier}`)
    }
  }
}

if (missing.length > 0) {
  console.error('Missing imports detected in legacy pages:')
  for (const item of missing.sort()) {
    console.error(`- ${item}`)
  }
  process.exit(1)
}

console.log(`Legacy import check passed for ${files.length} files.`)

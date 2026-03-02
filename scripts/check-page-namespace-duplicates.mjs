import { existsSync } from 'node:fs'

const conflictingNamespaces = [
  { canonical: 'offers', legacy: 'jobs' },
  { canonical: 'admin', legacy: 'administration' },
]

const violations = conflictingNamespaces
  .filter(({ canonical, legacy }) => {
    const canonicalPath = `app/pages/${canonical}`
    const legacyPath = `app/pages/${legacy}`
    return existsSync(canonicalPath) && existsSync(legacyPath)
  })
  .map(({ canonical, legacy }) =>
    `Namespace duplicate detected: app/pages/${legacy} overlaps with app/pages/${canonical}.`,
  )

if (violations.length > 0) {
  console.error('Page namespace duplicate check failed.')
  console.error(violations.join('\n'))
  process.exit(1)
}

console.log('Page namespace duplicate check passed.')

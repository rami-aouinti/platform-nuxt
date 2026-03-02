import { readFile } from 'node:fs/promises'

const descriptorsPath = new URL('../app/services/admin/resource-descriptors.ts', import.meta.url)
const content = await readFile(descriptorsPath, 'utf8')

function getBlock(source, marker) {
  const start = source.indexOf(marker)
  if (start < 0) {
    throw new Error(`Bloc introuvable: ${marker}`)
  }

  const braceStart = source.indexOf('{', start)
  let depth = 0
  for (let index = braceStart; index < source.length; index += 1) {
    const char = source[index]
    if (char === '{') depth += 1
    if (char === '}') depth -= 1
    if (depth === 0) {
      return source.slice(braceStart, index + 1)
    }
  }

  throw new Error(`Bloc non terminé: ${marker}`)
}

const descriptorBlock = getBlock(content, 'export const adminResourceDescriptors =')
const entityBlock = getBlock(content, 'export const adminEntityDefinitions =')

const descriptorKeys = [...descriptorBlock.matchAll(/^\s{2}([a-zA-Z0-9_]+):\s*\{/gm)].map(match => match[1])
const entityKeys = [...entityBlock.matchAll(/^\s{2}([a-zA-Z0-9_]+):\s*\{/gm)].map(match => match[1])

const missingDescriptors = entityKeys.filter(key => !descriptorKeys.includes(key))
if (missingDescriptors.length > 0) {
  throw new Error(`Entités sans descriptor: ${missingDescriptors.join(', ')}`)
}

const errors = []

for (const key of entityKeys) {
  const entitySectionMatch = entityBlock.match(new RegExp(`${key}:\\s*\\{([\\s\\S]*?)\\n  \\},`, 'm'))
  const descriptorSectionMatch = descriptorBlock.match(new RegExp(`${key}:\\s*\\{([\\s\\S]*?)\\n  \\},`, 'm'))

  const entitySection = entitySectionMatch?.[1] ?? ''
  const descriptorSection = descriptorSectionMatch?.[1] ?? ''

  if (!/schemaEndpoint\s*:/.test(entitySection) && !/schemaEndpoint\s*:/.test(descriptorSection)) {
    errors.push(`${key}: schemaEndpoint manquant`) 
  }

  if (!/list\s*:/.test(descriptorSection)) {
    errors.push(`${key}: endpoint list manquant dans descriptor`)
  }
}

if (errors.length > 0) {
  throw new Error(`Validation des entités échouée:\n- ${errors.join('\n- ')}`)
}

console.log(`Entity mapping check passed for ${entityKeys.length} entities.`)

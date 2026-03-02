import { describe, expect, it } from 'vitest'
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const SERVER_V1_ROOT = join(process.cwd(), 'server/api/v1')

function walkFiles(rootDir: string): string[] {
  const entries = readdirSync(rootDir)
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = join(rootDir, entry)
    const stats = statSync(fullPath)

    if (stats.isDirectory()) {
      files.push(...walkFiles(fullPath))
      continue
    }

    files.push(relative(SERVER_V1_ROOT, fullPath))
  }

  return files
}

describe('v1 first-class route manifest', () => {
  it('contains dedicated handlers for priority first-class domains', () => {
    const allV1Files = walkFiles(SERVER_V1_ROOT)
    const firstClassFiles = allV1Files
      .filter(file =>
        file.startsWith('tools/') ||
        file.startsWith('localization/') ||
        file.startsWith('catalog/') ||
        file.startsWith('me/notifications/') ||
        file.startsWith('me/chat/') ||
        file.startsWith('me/companies/') ||
        file.startsWith('me/profile/'),
      )
      .sort()

    expect(firstClassFiles).toMatchInlineSnapshot(`
      [
        "catalog/index.get.ts",
        "localization/index.get.ts",
        "me/chat/index.get.ts",
        "me/companies/index.get.ts",
        "me/notifications/index.get.ts",
        "me/profile/addresses.get.ts",
        "me/profile/addresses.post.ts",
        "me/profile/addresses/[addressId].delete.ts",
        "me/profile/addresses/[addressId].patch.ts",
        "me/profile/avatar.delete.ts",
        "me/profile/avatar.get.ts",
        "me/profile/avatar.patch.ts",
        "me/profile/companies.get.ts",
        "me/profile/configurations.get.ts",
        "me/profile/groups.get.ts",
        "me/profile/password.patch.ts",
        "me/profile/projects.get.ts",
        "me/profile/resumes.get.ts",
        "me/profile/resumes/[resumeId]/educations.get.ts",
        "me/profile/resumes/[resumeId]/experiences.get.ts",
        "me/profile/resumes/[resumeId]/skills.get.ts",
        "me/profile/roles.get.ts",
        "tools/health.get.ts",
        "tools/version.get.ts",
      ]
    `)
  })
})

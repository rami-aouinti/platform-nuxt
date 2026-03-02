import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('demo route regression guard', () => {
  it('removes the legacy auth demo page and keeps fallback 404 content', () => {
    const authPagePath = resolve(process.cwd(), 'app/pages/auth.vue')
    const fallbackPagePath = resolve(process.cwd(), 'app/pages/[...all].vue')

    expect(existsSync(authPagePath)).toBe(false)
    expect(readFileSync(fallbackPagePath, 'utf8')).toContain('Whoops, 404')
  })

  it('does not expose /auth in drawer navigation paths', () => {
    const drawerPath = resolve(process.cwd(), 'app/components/App/AppDrawer.vue')
    const drawerContent = readFileSync(drawerPath, 'utf8')

    expect(drawerContent).not.toContain("'/auth'")
    expect(drawerContent).not.toContain('"/auth"')
  })
})

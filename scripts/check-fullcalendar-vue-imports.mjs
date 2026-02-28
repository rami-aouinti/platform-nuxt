import { execSync } from 'node:child_process'

const cmd = `rg -n --glob '*.{ts,tsx,js,mjs,cjs,vue}' "@fullcalendar/vue['"]" app`

try {
  const output = execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim()

  if (output) {
    console.error('`@fullcalendar/vue` imports are forbidden in app/**. Use `@fullcalendar/vue3` instead.')
    for (const line of output.split('\n')) {
      console.error(`- ${line}`)
    }
    process.exit(1)
  }
} catch (error) {
  const output = error.stdout?.toString().trim()

  if (output) {
    console.error('`@fullcalendar/vue` imports are forbidden in app/**. Use `@fullcalendar/vue3` instead.')
    for (const line of output.split('\n')) {
      console.error(`- ${line}`)
    }
    process.exit(1)
  }
}

console.log('No forbidden `@fullcalendar/vue` imports found in app/**.')

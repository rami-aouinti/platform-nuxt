import { execSync } from 'node:child_process'

const target = 'app/pages/legacy'
const command = `rg -n "require\\(" ${target} --glob "**/*.vue"`

try {
  const output = execSync(command, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim()

  if (output) {
    console.error('CommonJS require() usage is forbidden in legacy Vue pages:')
    console.error(output)
    process.exit(1)
  }
} catch (error) {
  const stdout = error.stdout?.toString().trim() ?? ''
  const stderr = error.stderr?.toString().trim() ?? ''

  // rg exits with code 1 when no matches are found.
  if (error.status === 1 && !stdout) {
    console.log(`No require() usage found in ${target}.`)
    process.exit(0)
  }

  console.error('Failed to run legacy require() check.')
  if (stdout) console.error(stdout)
  if (stderr) console.error(stderr)
  process.exit(1)
}

console.log(`No require() usage found in ${target}.`)

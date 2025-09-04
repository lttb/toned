import * as path from 'node:path'
import { $ } from 'bun'

const cwd = process.cwd()
const dist = path.resolve(cwd, 'dist/')

const transformPkg = async () => {
  const { scripts, devDependencies, ...pkg } =
    await Bun.file('package.json').json()

  await Bun.write(
    path.join(dist, 'package.json'),
    JSON.stringify(pkg, null, 2),
    { createPath: true },
  )
}

await $`rm -rf ${dist}`

await $`bun --bun ${path.join(__dirname, 'node_modules', '.bin', 'rollup')} -c .config.rollup.ts --configPlugin typescript`

await $`cp README.md ${dist}`
await transformPkg()
await $`cp ../../LICENSE ${dist}`

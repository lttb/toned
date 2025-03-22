import { $ } from 'bun'

import * as path from 'node:path'

const cwd = process.cwd()
const dist = path.resolve(cwd, 'dist/')

const transformPkg = async () => {
	const { scripts, devDependencies, ...pkg } =
		await Bun.file('package.json').json()

	await Bun.write('dist/package.json', JSON.stringify(pkg, null, 2))
}

await $`rm -rf ${dist}`

await $`bun --bun rollup -c .config.rollup.ts`

await $`cp README.md ${dist}`
await transformPkg()
await $`cp ../../LICENSE ${dist}`

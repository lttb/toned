import * as path from 'node:path'

await Bun.build({
	entrypoints: [
		path.join(__dirname, './react.ts'),
		path.join(__dirname, './react.native.ts'),
	],
})

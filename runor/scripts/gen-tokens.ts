#!/usr/bin/env bun

import { parseArgs } from 'node:util'
import * as path from 'node:path'
import assert from 'node:assert'

import type { Tokens } from '@runor/core/types'

const { values, positionals } = parseArgs({
	strict: true,
	allowPositionals: true,
})

const [filepath, output] = positionals

assert(filepath && output, 'filepath and output are requried')

const tokens = (await import(path.join(process.cwd(), filepath))) as {
	default: Tokens
}

await Bun.write(
	path.resolve(process.cwd(), output),
	`:root {
${Object.entries(tokens.default)
	.map(([key, value]) => `--${key}: ${value}`)
	.join(';\n')}
}`,
	{ createPath: true },
)

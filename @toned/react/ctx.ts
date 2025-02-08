// @ts-expect-error
import { createContext } from 'react'

import type { Tokens } from '@toned/core/types'

export const defineContext = (tokens: Tokens) =>
	new Proxy(tokens, {
		get(_target, prop: string) {
			return `var(--${prop})`
		},
	})

export const TokensContext = createContext<Tokens>(defineContext({}))

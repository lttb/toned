import { createContext } from 'react'

import type { Tokens } from '@runor/core/types'
import { create } from './index.common'

export const TokensContext = createContext<Tokens>(
	new Proxy({} as Tokens, {
		get(_target, prop: string) {
			return `var(--${prop})`
		},
	}),
)

export const { useStyles } = create(TokensContext)

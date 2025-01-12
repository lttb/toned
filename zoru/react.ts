import { createContext } from 'react'

import type { Tokens } from './types'
import { createAttach } from './react.common'

export const TokensContext = createContext<Tokens>(
	new Proxy({} as Tokens, {
		get(_target, prop: string) {
			return `var(--${prop})`
		},
	}),
)

export const attachSystem = createAttach(TokensContext)

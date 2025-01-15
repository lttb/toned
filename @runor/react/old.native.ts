import { createContext } from 'react'

import type { Tokens } from '@runor/core/types'
import { create } from './old.common'

export const TokensContext = createContext<Tokens>({})

export const { useStyles } = create(TokensContext, (ctx, prop) => {
	const value = ctx[prop]

	if (typeof value !== 'string') {
		return value
	}

	if (value.startsWith('var')) {
		return ctx[value.slice(6, -1)]
	}

	if (value.includes('px')) {
		return Number.parseInt(value, 10)
	}

	return value
})

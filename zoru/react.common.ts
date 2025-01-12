import { use, type Context } from 'react'

import type { Tokens, TokenConfig, TokenSystem } from './types'

export const createAttach = (TokensContext: Context<Tokens>) =>
	function attachSystem<const S extends Record<string, TokenConfig<any, any>>>(
		system: TokenSystem<S>,
	) {
		const tokens = new Proxy({} as Tokens, {
			get(_target, prop: string) {
				const context = use(TokensContext)

				return context[prop]
			},
		})

		return system({ tokens })
	}

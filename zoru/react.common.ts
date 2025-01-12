import { useContext, type Context } from 'react'

import type { Tokens, TokenConfig, TokenSystem } from './types'

export const createAttach = (
	TokensContext: Context<Tokens>,
	get: (context: Tokens, prop: string) => string | number = (context, prop) =>
		context[prop],
) =>
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	function attachSystem<const S extends Record<string, TokenConfig<any, any>>>(
		system: TokenSystem<S>,
	) {
		const tokens = new Proxy({} as Tokens, {
			get(_target, prop: string) {
				const context = useContext(TokensContext)

				return get(context, prop)
			},
		})

		return system({ tokens })
	}

import type { CSSProperties } from 'react'

import type { Tokens, TokenConfig, TokenSystem } from './types'

export function defineToken<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const Values extends readonly any[],
	Result extends CSSProperties,
>(config: TokenConfig<Values, Result>) {
	return config
}

export function defineUnit<T extends typeof Number | typeof String>(
	type: T,
	resolver: (value: InstanceType<T>, tokens: Tokens) => number | string,
) {
	return resolver
}

export function defineSystem<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const S extends Record<string, TokenConfig<any, any>>,
>(system: S): TokenSystem<S> {
	return (config: { tokens: Tokens }) =>
		<
			T extends Partial<{
				[key in keyof S]: S[key]['values'][number]
			}>,
		>(
			tokens: T,
		) => {
			return Object.entries(tokens).reduce<{ style: CSSProperties }>(
				(acc, [k, v]) => {
					if (!v) return acc

					Object.assign(acc.style, system[k].resolve(v, config.tokens))

					return acc
				},
				{ style: {} },
			)
		}
}

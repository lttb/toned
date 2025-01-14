import type { CSSProperties } from 'react'

import {
	type Tokens,
	type TokenConfig,
	type TokenSystem,
	SYMBOL_REF,
} from './types'

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
	const ref: TokenSystem<S> = {
		system,
		t: (value) => Object.assign({}, value, { [SYMBOL_REF]: ref }),
		stylesheet: (value) => Object.assign({}, value, { [SYMBOL_REF]: ref }),
		exec: (config, tokenStyle) => {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			return Object.entries(tokenStyle).reduce<{ style: any }>(
				(acc, [k, v]) => {
					if (!v) return acc

					Object.assign(acc.style, system[k].resolve(v, config.tokens))

					return acc
				},
				{ style: {} },
			)
		},
	}

	return ref
}

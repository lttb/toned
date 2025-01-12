import type { CSSProperties } from 'react'

import type { Exact } from './types'

type Tokens = Record<string, string>

type TokenConfig<Values extends readonly any[], Result> = {
	values: Values
	resolve: (value: Values[number], tokens: Tokens) => Result
}

export function defineToken<
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
	const S extends Record<string, TokenConfig<any, any>>,
>(system: S) {
	return <T>(
		tokens: Exact<
			T,
			Partial<{
				[key in keyof S]: S[key]['values'][number]
			}>
		>,
	) => {
		return Object.entries(tokens).reduce<{ style: CSSProperties }>(
			(acc, [k, v]) => {
				if (!v) return acc

				Object.assign(acc.style, system[k].resolve(v, {}))

				return acc
			},
			{ style: {} },
		)
	}
}

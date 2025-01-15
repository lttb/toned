import * as React from 'react'

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

const SYMBOL_STYLE: unique symbol = Symbol()
const SYMBOL_ACCESS: unique symbol = Symbol()

import { TokensContext } from './ctx'

export function defineSystem<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const S extends Record<string, TokenConfig<any, any>>,
>(system: S): TokenSystem<S> {
	const ref: TokenSystem<S> = {
		system,
		t: (value) => {
			const result = {
				[SYMBOL_REF]: ref,
				[SYMBOL_STYLE]: value,
				[SYMBOL_ACCESS]: { ref, value },
				style: {},
			}

			return new Proxy(result as any, {
				get(target, prop) {
					if (prop === 'style') {
						const tokens =
							React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current?.readContext(
								TokensContext,
							)

						return ref.exec({ tokens }, value)
					}

					return undefined
				},
			})
		},
		stylesheet: (value) =>
			Object.assign(
				{},
				Object.fromEntries(
					Object.entries(value).map(([k, v]) => [k, ref.t(v)]),
				),
				{ [SYMBOL_REF]: ref },
			),
		exec: (config, tokenStyle) => {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			return Object.entries(tokenStyle).reduce<{}>((acc, [k, v]) => {
				if (!v) return acc

				Object.assign(acc, system[k].resolve(v, config.tokens))

				return acc
			}, {})
		},
	}

	return ref
}

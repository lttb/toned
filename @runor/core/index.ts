import {
	type Tokens,
	type TokenConfig,
	type TokenSystem,
	SYMBOL_REF,
} from './types'

const config = {
	getTokens: (): Tokens => ({}),
}

export function setConfig(newConfig: Partial<typeof config>) {
	Object.assign(config, newConfig)
}

export function defineToken<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const Values extends readonly any[],
	// TODO: think about the result type (like, CSSProperties)
	Result extends {},
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
				get style() {
					const tokens = config.getTokens()

					return ref.exec({ tokens }, value)
				},
			}

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			return result as any
		},
		stylesheet: (value) =>
			Object.assign(
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				{} as any,
				Object.fromEntries(
					Object.entries(value).map(([k, v]) => [k, ref.t(v)]),
				),
				{ [SYMBOL_REF]: ref },
			),
		exec: (config, tokenStyle) => {
			return Object.entries(tokenStyle).reduce<object>((acc, [k, v]) => {
				if (!v) return acc

				Object.assign(acc, system[k].resolve(v, config.tokens))

				return acc
			}, {})
		},
	}

	return ref
}

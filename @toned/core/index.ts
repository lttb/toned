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

const SYMBOL_STYLE = Symbol()
const SYMBOL_ACCESS = Symbol()

export function defineSystem<
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const S extends Record<string, TokenConfig<any, any>>,
>(system: S): TokenSystem<S> {
	const ref: TokenSystem<S> = {
		system,
		t: (...values) => {
			const value = values.reduce(
				(acc, v) => Object.assign(acc, SYMBOL_STYLE in v ? v[SYMBOL_STYLE] : v),
				{},
			)

			if (SYMBOL_REF in value) {
				return value
			}

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
		stylesheet: (value) => {
			function Base(_ref) {
				this.ref = _ref
			}

			const setStyles = (curr, style) => {
				if (curr.setNativeProps) {
					curr.setNativeProps({ style })
				} else {
					curr.removeAttribute('style')
					Object.assign(curr.style, style)
				}
			}

			Object.entries(value).map(([k, v]) => {
				const setOn = (result, selfRef, pseudo, onIn, onOut) => {
					if (!(pseudo in v)) return

					result[onIn] = () => {
						Object.entries(v[pseudo]).forEach(([_k, _v]) => {
							const curr = selfRef.__refs__[_k]

							setStyles(curr, {
								// todo: it should be prev style, not original
								...ref.exec({ tokens: selfRef.tokens }, value[_k]),
								...ref.exec({ tokens: selfRef.tokens }, _v),
							})
						})
					}

					result[onOut] = () => {
						Object.entries(v[pseudo]).forEach(([_k, _v]) => {
							const curr = selfRef.__refs__[_k]

							setStyles(curr, ref.exec({ tokens: selfRef.tokens }, value[_k]))
						})
					}
				}

				Object.defineProperty(Base.prototype, k, {
					get() {
						const result = {
							ref: (current) => {
								this.ref.__refs__[k] = current
							},
							style: ref.exec({ tokens: this.ref.tokens }, v),
						}

						setOn(result, this.ref, ':hover', 'onHoverIn', 'onHoverOut')
						setOn(result, this.ref, ':active', 'onPressIn', 'onPressOut')
						setOn(result, this.ref, ':focus', 'onBlur', 'onFocus')

						return result
					},
				})
			})

			return Object.assign(
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				{} as any,
				// Object.fromEntries(
				// 	Object.entries(value).map(([k, v]) => [k, ref.t(v)]),
				// ),
				{
					[SYMBOL_REF]: ref,
					__value__: (_ref) => {
						const tokens = config.getTokens()

						_ref.current ??= { tokens, __refs__: {} }

						_ref.current.base ??= new Base(_ref.current)

						return _ref.current.base
					},
				},
			)
		},
		exec: (config, tokenStyle) => {
			return Object.entries(tokenStyle).reduce<object>((acc, [k, v]) => {
				if (!v) return acc

				if (k[0] === ':') {
					return acc
				}

				Object.assign(acc, system[k].resolve(v, config.tokens))

				return acc
			}, {})
		},
	}

	return ref
}

const weak = new WeakMap()

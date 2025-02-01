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

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type AnyValue = any

type Ref = AnyValue
type RefStyle = AnyValue

type PseudoState = ':hover' | ':focus' | ':active'

const setStyles = (curr: Ref, style: RefStyle) => {
	if (curr.setNativeProps) {
		curr.setNativeProps({ style })
	} else {
		curr.removeAttribute('style')
		Object.assign(curr.style, style)
	}
}

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
			type State = Record<string, Record<PseudoState | 'base', boolean>>

			type ElementKey = string

			type ElementStyle = AnyValue
			type AppliedStyle = AnyValue

			class Base {
				tokens: Tokens
				state: State
				stateCache: Record<ElementKey, Map<number, AppliedStyle>>

				refs: Record<ElementKey, Ref>

				constructor({ tokens }: { tokens: Tokens }) {
					this.tokens = tokens
					this.state = {}
					this.stateCache = {}
					this.refs = {}
				}

				getStateKey(key: ElementKey) {
					const {
						base,
						':hover': hover,
						':focus': focus,
						':active': active,
					} = this.state[key]

					return +base | (+hover << 1) | (+focus << 2) | (+active << 3)
				}

				getCurrentStyle(key: ElementKey) {
					return this.stateCache[key].get(this.getStateKey(key))
				}

				applyTokens(value: ElementStyle): AppliedStyle {
					return ref.exec({ tokens: this.tokens || config.getTokens() }, value)
				}

				setOn = (
					v: ElementStyle,
					pseudo: PseudoState,
					onIn: string,
					onOut: string,
				) => {
					if (!(pseudo in v)) return

					return {
						[onIn]: () => {
							Object.entries(v[pseudo]).forEach(([elementKey, tokenStyle]) => {
								if (this.state[elementKey][pseudo]) return

								const currentStyle = this.getCurrentStyle(elementKey)

								this.state[elementKey][pseudo] = true

								const cacheKey = this.getStateKey(elementKey)

								const updatedStyle = {
									...currentStyle,
									...this.applyTokens(tokenStyle),
								}

								this.stateCache[elementKey].set(cacheKey, updatedStyle)

								setStyles(this.refs[elementKey], updatedStyle)
							})
						},

						[onOut]: () => {
							Object.entries(v[pseudo]).forEach(([elementKey]) => {
								if (!this.state[elementKey][pseudo]) return

								this.state[elementKey][pseudo] = false

								const currentStyle = this.getCurrentStyle(elementKey)

								setStyles(this.refs[elementKey], currentStyle)
							})
						},
					}
				}
			}

			Object.entries(value).map(([k, v]) => {
				Object.defineProperty(Base.prototype, k, {
					get(this: Base) {
						if (!this.state[k]) {
							this.state[k] = {
								base: true,
								':hover': false,
								':focus': false,
								':active': false,
							}

							this.stateCache[k] = new Map([
								[this.getStateKey(k), this.applyTokens(v)],
							])
						}

						const result = {
							ref: (current: Ref) => {
								this.refs[k] = current
							},
							style: this.getCurrentStyle(k),

							// TODO: support an option with a `style` function state
							...this.setOn(v, ':hover', 'onHoverIn', 'onHoverOut'),
							...this.setOn(v, ':active', 'onPressIn', 'onPressOut'),
							...this.setOn(v, ':focus', 'onBlur', 'onFocus'),
						}

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
					__value__: (stylesheetRef: Ref) => {
						stylesheetRef.current ??= new Base({ tokens: config.getTokens() })

						return stylesheetRef.current
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

				if (k === 'style') {
					Object.assign(acc, v)

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

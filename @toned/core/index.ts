import {
	SYMBOL_REF,
	SYMBOL_INIT,
	type Tokens,
	type TokenConfig,
	type TokenSystem,
	type ModType,
	type ModStyle,
	type TokenStyle,
	type StyleWithPseudo,
} from './types'

import { StyleMatcher } from './StyleMatcher/StyleMatcher'

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

const setStyles = (curr: Ref | undefined, style: RefStyle) => {
	if (!curr) return

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
		stylesheet: <T extends Record<string, TokenStyle<S>>>(
			value: StyleWithPseudo<S, T>,
		) => {
			type State = Record<string, Record<PseudoState | 'base', boolean>>

			type ElementKey = string

			type ElementStyle = AnyValue
			type AppliedStyle = AnyValue

			type StyleDecl = Record<ElementKey, ElementStyle>

			class Base {
				tokens: Tokens
				state: State
				stateCache: Record<ElementKey, Map<number, AppliedStyle>>

				refs: Record<ElementKey, Ref>

				matcher?: StyleMatcher<any>
				modsState?: any
				modsStateCache: Map<number, Record<ElementKey, AppliedStyle>>
				modsStyle?: StyleDecl

				mergedStyle: StyleDecl

				constructor({
					tokens,
					mods,
					modsState,
				}: { tokens: Tokens; mods?: any; modsState?: any }) {
					this.tokens = tokens
					this.state = {}
					this.stateCache = {}
					this.refs = {}

					if (mods) {
						this.matcher = new StyleMatcher(mods)

						if (modsState) {
							this.modsState = modsState
							this.modsStyle = this.matcher.match(modsState)
						}
					}

					this.modsStateCache = new Map()

					this.mergedStyle = this.mergeStyles(value, this.modsStyle)
				}

				// b has to be a subset of a
				mergeStyles(a: StyleDecl, b?: StyleDecl) {
					const style: StyleDecl = {}

					for (const key in a) {
						style[key] = Object.assign({}, a[key], b?.[key])
					}

					return style
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
					return this.applyTokens(this.mergedStyle[key])
				}

				getBaseStyle(key: ElementKey) {
					return this.stateCache[key].get(this.getStateKey(key))
				}

				getStateStyle(key: ElementKey) {
					const style = this.modsStyle?.[key]
					if (style) {
						return this.applyTokens(style)
					}
				}

				applyTokens(value: ElementStyle): AppliedStyle {
					return ref.exec({ tokens: this.tokens || config.getTokens() }, value)
				}

				applyState(modsState: any) {
					if (!this.matcher) return

					this.modsState = modsState

					// const modsStateCacheKey = this.matcher?.getPropsBits(modsState)

					const stateStyle = this.matcher.match(modsState)

					this.mergedStyle = this.mergeStyles(value, stateStyle)

					for (const elementKey in stateStyle) {
						const currentStyle = this.getBaseStyle(elementKey)

						const updatedStyle = {
							...currentStyle,
							...this.applyTokens(stateStyle[elementKey]),
						}

						setStyles(this.refs[elementKey], updatedStyle)
					}
				}

				setOn = (
					elementKey: ElementKey,
					pseudo: PseudoState,
					onIn: string,
					onOut: string,
				) => {
					const v = this.mergedStyle[elementKey]

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

						const isBrowser = typeof document !== 'undefined'

						const result = {
							ref: (current: Ref) => {
								this.refs[k] = current
							},
							style: this.getCurrentStyle(k),

							// TODO: move it to config
							...(isBrowser
								? {
										...this.setOn(k, ':hover', 'onMouseOver', 'onMouseOut'),
										...this.setOn(k, ':active', 'onMouseDown', 'onMouseUp'),
										...this.setOn(k, ':focus', 'onBlur', 'onFocus'),
									}
								: {
										// TODO: support an option with a `style` function state
										...this.setOn(k, ':hover', 'onHoverIn', 'onHoverOut'),
										...this.setOn(k, ':active', 'onPressIn', 'onPressOut'),
										...this.setOn(k, ':focus', 'onBlur', 'onFocus'),
									}),
						}

						return result
					},
				})
			})

			const withMods = <Mods extends ModType>(mods?: ModStyle<S, T, Mods>) => {
				return Object.assign({
					[SYMBOL_REF]: ref,
					[SYMBOL_INIT]: (modsState) => {
						return new Base({ tokens: config.getTokens(), mods, modsState })
					},

					with<Mods extends ModType>(mods: ModStyle<S, T, Mods>) {
						return withMods(mods)
					},
				})
			}

			return withMods()
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

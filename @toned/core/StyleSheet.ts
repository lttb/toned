import {
	SYMBOL_REF,
	SYMBOL_INIT,
	type Tokens,
	type TokenSystem,
	type ModType,
	type ModStyle,
	type TokenStyle,
	type StyleWithPseudo,
	type TokenStyleDeclaration,
} from './types'

import { getConfig } from './config'

import { StyleMatcher } from './StyleMatcher/StyleMatcher'

type PseudoState = ':hover' | ':focus' | ':active'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type AnyValue = any

type Ref = AnyValue
type RefStyle = AnyValue

const setStyles = (curr: Ref | undefined, style: RefStyle) => {
	if (!curr) return

	// TODO: move to config
	if (curr.setNativeProps) {
		curr.setNativeProps({ style })
	} else {
		curr.removeAttribute('style')
		Object.assign(curr.style, style)
	}
}

type State = Record<string, Record<PseudoState | 'base', boolean>>

type ElementKey = string

type ElementStyle = AnyValue
type AppliedStyle = AnyValue

type StyleDecl = Record<ElementKey, ElementStyle>

// TODO: make it type safe
type ModState = AnyValue

export function createStylesheet<
	S extends TokenStyleDeclaration,
	T extends Record<string, TokenStyle<S>>,
>(ref: TokenSystem<S>, rules: StyleWithPseudo<S, T>) {
	class Base {
		tokens: Tokens
		state: State
		stateCache: Record<ElementKey, Map<number, AppliedStyle>>

		refs: Record<ElementKey, Ref>

		matcher?: StyleMatcher
		modsState?: ModState
		modsStateCache: Map<number, Record<ElementKey, AppliedStyle>>
		modsStyle?: StyleDecl

		mergedStyle: StyleDecl

		constructor({
			tokens,
			mods,
			modsState,
		}: {
			tokens: Tokens
			mods?: ModStyle<S, T, ModType>
			modsState?: ModState
		}) {
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

			this.mergedStyle = this.mergeStyles(rules, this.modsStyle)
		}

		mergeStyles(a: StyleDecl, b?: StyleDecl) {
			const style: StyleDecl = {}

			for (const key in a) {
				style[key] = Object.assign({}, a[key], b?.[key])
			}

			return style
		}

		getInteractionState(key: ElementKey) {
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
			return this.stateCache[key].get(this.getInteractionState(key))
		}

		getStateStyle(key: ElementKey) {
			const style = this.modsStyle?.[key]
			if (style) {
				return this.applyTokens(style)
			}
		}

		applyTokens(value: ElementStyle): AppliedStyle {
			return ref.exec({ tokens: this.tokens || getConfig().getTokens() }, value)
		}

		applyState(modsState: ModState) {
			if (!this.matcher) return

			this.modsState = modsState

			// const modsStateCacheKey = this.matcher?.getPropsBits(modsState)

			const stateStyle = this.matcher.match(modsState)

			this.mergedStyle = this.mergeStyles(rules, stateStyle)

			for (const elementKey in stateStyle) {
				const currentStyle = this.getBaseStyle(elementKey)

				const updatedStyle = {
					...currentStyle,
					...this.applyTokens(stateStyle[elementKey]),
				}

				setStyles(this.refs[elementKey], updatedStyle)
			}
		}

		onStateEnter = (stateName: string, rule: StyleDecl) => {
			Object.entries(rule).forEach(([elementKey, tokenStyle]) => {
				const currentStyle = this.getCurrentStyle(elementKey)

				// const cacheKey = this.getStateKey(elementKey)

				// TODO: cache by stateName by element
				const updatedStyle = {
					...currentStyle,
					...this.applyTokens(tokenStyle),
				}

				// this.stateCache[elementKey].set(cacheKey, updatedStyle)

				setStyles(this.refs[elementKey], updatedStyle)
			})
		}

		onStateLeave = (stateName: string, rule: StyleDecl) => {
			Object.entries(rule).forEach(([elementKey]) => {
				const currentStyle = this.getCurrentStyle(elementKey)

				setStyles(this.refs[elementKey], currentStyle)
			})
		}

		setOn = (
			elementKey: ElementKey,
			pseudo: PseudoState,
			onIn: string,
			onOut: string,
		) => {
			const elementRule = this.mergedStyle[elementKey]

			if (!(pseudo in elementRule)) return

			return {
				[onIn]: () => {
					this.onStateEnter(pseudo, elementRule[pseudo])
				},

				[onOut]: () => {
					this.onStateLeave(pseudo, elementRule[pseudo])
				},
			}
		}
	}

	Object.entries(rules).forEach(([elementKey, elementRule]) => {
		Object.defineProperty(Base.prototype, elementKey, {
			get(this: Base) {
				if (!this.state[elementKey]) {
					this.state[elementKey] = {
						base: true,
						':hover': false,
						':focus': false,
						':active': false,
					}

					this.stateCache[elementKey] = new Map([
						[
							this.getInteractionState(elementKey),
							this.applyTokens(elementRule),
						],
					])
				}

				const isBrowser = typeof document !== 'undefined'

				const hasInteraction =
					elementRule[':active'] ||
					elementRule[':hover'] ||
					elementRule[':focus']

				const result = {
					ref: (current: Ref) => {
						this.refs[elementKey] = current
					},
					style: this.getCurrentStyle(elementKey),
					// style: hasInteraction ? ({focused, hovered, pressed}) => {
					//        return this.getCurrentStyle(elementKey)
					//      } : this.getCurrentStyle(elementKey),

					// TODO: move it to config
					...(isBrowser
						? {
								...this.setOn(
									elementKey,
									':hover',
									'onMouseOver',
									'onMouseOut',
								),
								...this.setOn(
									elementKey,
									':active',
									'onMouseDown',
									'onMouseUp',
								),
								...this.setOn(elementKey, ':focus', 'onBlur', 'onFocus'),
							}
						: {
								// TODO: support an option with a `style` function state
								...this.setOn(elementKey, ':hover', 'onHoverIn', 'onHoverOut'),
								...this.setOn(elementKey, ':active', 'onPressIn', 'onPressOut'),
								...this.setOn(elementKey, ':focus', 'onBlur', 'onFocus'),
							}),
				}

				return result
			},
		})
	})

	const withMods = <Mods extends ModType>(
		baseModStyle?: ModStyle<S, T, Mods>,
	) => {
		return Object.assign({
			[SYMBOL_REF]: ref,
			[SYMBOL_INIT]: (modsState: ModState) => {
				return new Base({
					tokens: getConfig().getTokens(),
					mods: baseModStyle,
					modsState,
				})
			},

			with<Mods extends ModType>(modStyle: ModStyle<S, T, Mods>) {
				return withMods({ ...baseModStyle, ...modStyle })
			},
		})
	}

	return withMods()
}

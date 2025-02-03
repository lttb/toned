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

		matcher: StyleMatcher
		modsState: ModState
		modsStyle: StyleDecl

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

			this.matcher = new StyleMatcher({
				...rules,
				...mods,
			})

			this.modsState = modsState || {}
			this.modsStyle = this.matcher.match(this.modsState)

			console.log(this.matcher.list)
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
			return this.applyTokens(this.modsStyle[key])
		}

		applyTokens(value: ElementStyle): AppliedStyle {
			return ref.exec({ tokens: this.tokens || getConfig().getTokens() }, value)
		}

		applyState(modsState: ModState) {
			Object.assign(this.modsState, modsState)

			this.modsStyle = this.matcher.match(this.modsState)

			for (const elementKey in this.modsStyle) {
				setStyles(this.refs[elementKey], this.getCurrentStyle(elementKey))
			}
		}

		setOn = (
			elementKey: ElementKey,
			pseudo: PseudoState,
			onIn: string,
			onOut: string,
		) => {
			return {
				[onIn]: () => {
					this.applyState({
						[`${elementKey}${pseudo}`]: true,
					})
				},

				[onOut]: () => {
					this.applyState({
						[`${elementKey}${pseudo}`]: false,
					})
				},
			}
		}
	}

	Object.entries(rules).forEach(([elementKey, elementRule]) => {
		Object.defineProperty(Base.prototype, elementKey, {
			get(this: Base) {
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

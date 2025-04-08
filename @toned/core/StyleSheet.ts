import {
	SYMBOL_REF,
	SYMBOL_INIT,
	type Tokens,
	type TokenSystem,
	type ModType,
	type StylesheetValue,
	type TokenStyleDeclaration,
	type Config,
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
	Mods extends ModType,
	T,
>(ref: TokenSystem<S>, rules: StylesheetValue<S, Mods, T>) {
	class Base {
		config: Config

		tokens: Tokens
		state: State
		stateCache: Record<ElementKey, Map<number, AppliedStyle>>

		refs: Record<ElementKey, Ref>

		matcher: StyleMatcher
		modsState: ModState
		modsStyle!: StyleDecl
		modsStylePrev!: StyleDecl

		interactiveState: Record<string, Record<string, boolean>> = {}

		constructor({
			config,
			modsState,
		}: {
			config: Config
			modsState?: ModState
		}) {
			this.config = config ?? getConfig()

			this.tokens = this.config.getTokens()
			this.state = {}
			this.stateCache = {}
			this.refs = {}

			this.matcher = new StyleMatcher(rules)

			this.modsState = modsState || {}
			// this.modsStyle = this.matcher.match(this.modsState)

			this.matchStyles()

			// console.log(this.matcher.list)
		}

		// mergeStyles(a: StyleDecl, b?: StyleDecl) {
		// 	const style: StyleDecl = {}
		//
		// 	for (const key in a) {
		// 		style[key] = Object.assign({}, a[key], b?.[key])
		// 	}
		//
		// 	return style
		// }

		// getInteractionState(key: ElementKey) {
		// 	const {
		// 		base,
		// 		':hover': hover,
		// 		':focus': focus,
		// 		':active': active,
		// 	} = this.state[key]
		//
		// 	return +base | (+hover << 1) | (+focus << 2) | (+active << 3)
		// }

		matchStyles() {
			this.modsStylePrev = this.modsStyle
			this.modsStyle = this.matcher.match(this.modsState)
		}

		getCurrentStyle(key: ElementKey) {
			return this.applyTokens(this.modsStyle[key])
		}

		applyTokens(value: ElementStyle): AppliedStyle {
			return ref.exec({ tokens: this.tokens }, value)
		}

		applyElementStyles() {
			this.matcher.elementSet.forEach((elementKey) => {
				if (
					this.matcher.isEqual(elementKey, this.modsStylePrev, this.modsStyle)
				) {
					return
				}

				setStyles(this.refs[elementKey], this.getCurrentStyle(elementKey))
			})
		}

		applyState(modsState: ModState) {
			Object.assign(this.modsState, modsState)

			this.matchStyles()

			this.applyElementStyles()
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

				// const hasInteraction =
				// 	elementRule[':active'] ||
				// 	elementRule[':hover'] ||
				// 	elementRule[':focus']

				const result = {
					ref: (current: Ref) => {
						this.refs[elementKey] = current
					},

					// TODO: move to the configuration platform-agnostic level

					style: this.matcher.interactions[elementKey]
						? isBrowser
							? this.getCurrentStyle(elementKey)
							: (state: any) => {
									const interactiveState = {
										':hover': state.hovered,
										':active': state.pressed,
										':focus': state.focused,
									}

									if (!this.interactiveState[elementKey]) {
										this.interactiveState[elementKey] = interactiveState
										return this.getCurrentStyle(elementKey)
									}

									this.interactiveState[elementKey] = interactiveState

									Object.assign(this.modsState, {
										[`${elementKey}:hover`]: state.hovered,
										[`${elementKey}:focus`]: state.focused,
										[`${elementKey}:active`]: state.pressed,
									})

									this.matchStyles()

									this.applyElementStyles()
								}
						: this.getCurrentStyle(elementKey),

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
						: {}),

					// style: this.getCurrentStyle(elementKey),

					// style: hasInteraction ? ({focused, hovered, pressed}) => {
					//        return this.getCurrentStyle(elementKey)
					//      } : this.getCurrentStyle(elementKey),

					// TODO: move it to config
					// ...(isBrowser
					// 	? {
					// 			...this.setOn(
					// 				elementKey,
					// 				':hover',
					// 				'onMouseOver',
					// 				'onMouseOut',
					// 			),
					// 			...this.setOn(
					// 				elementKey,
					// 				':active',
					// 				'onMouseDown',
					// 				'onMouseUp',
					// 			),
					// 			...this.setOn(elementKey, ':focus', 'onBlur', 'onFocus'),
					// 		}
					// 	: {
					// 			// TODO: support an option with a `style` function state
					// 			...this.setOn(elementKey, ':hover', 'onHoverIn', 'onHoverOut'),
					// 			...this.setOn(elementKey, ':active', 'onPressIn', 'onPressOut'),
					// 			...this.setOn(elementKey, ':focus', 'onBlur', 'onFocus'),
					// 		}),
				}

				return result
			},
		})
	})

	return Object.assign({
		[SYMBOL_REF]: ref,
		[SYMBOL_INIT]: (config: Config, modsState: ModState) => {
			return new Base({
				config,
				modsState,
			})
		},
	})
}

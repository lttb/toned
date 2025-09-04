import { getConfig } from './config'
import { StyleMatcher } from './StyleMatcher/StyleMatcher'
import {
  type Config,
  type ModType,
  type StylesheetValue,
  SYMBOL_INIT,
  SYMBOL_REF,
  type TokenStyleDeclaration,
  type TokenSystem,
  type Tokens,
} from './types'

type PseudoState = ':hover' | ':focus' | ':active'

// biome-ignore lint/suspicious/noExplicitAny: ignore
type AnyValue = any

type Ref = AnyValue
type RefStyle = AnyValue

const setStyles = (refs: RefMap, style: RefStyle) => {
  refs.forEach((curr) => {
    if (!curr) return
    // TODO: move to config
    if (curr.setNativeProps) {
      curr.setNativeProps({ style })
    } else {
      curr.removeAttribute('style')
      Object.assign(curr.style, style)
    }
  })
}

type State = Record<string, Record<PseudoState | 'base', boolean>>

type ElementKey = string

type ElementStyle = AnyValue
type AppliedStyle = AnyValue

type StyleDecl = Record<ElementKey, ElementStyle>

// TODO: make it type safe
type ModState = AnyValue

type RefConfig = AnyValue

type RefMap = Map<Ref, RefConfig>

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

    refs: Record<ElementKey, RefMap>

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

      const mediaEmitter = initMedia()

      // TODO: think about perf improvements
      this.modsState = {
        ...modsState,
        ...mediaEmitter.data,
      }
      // this.modsStyle = this.matcher.match(this.modsState)

      this.matchStyles()

      mediaEmitter.sub(() => {
        this.applyState(mediaEmitter.data || {})
      })

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

    getCurrentStyle(key: ElementKey, ref?: Ref) {
      // apply refs
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

  Object.entries(rules).forEach(([elementKey, _elementRule]) => {
    Object.defineProperty(Base.prototype, elementKey, {
      get(this: Base) {
        const isBrowser = typeof document !== 'undefined' || true

        // const hasInteraction =
        // 	elementRule[':active'] ||
        // 	elementRule[':hover'] ||
        // 	elementRule[':focus']

        const createResult = (options?: any[]) => {
          const result = {
            ref: (current: Ref) => {
              this.refs[elementKey] ??= new Map()
              this.refs[elementKey].set(result.ref, { ref: current, options })
            },

            with: (...args: any[]) => {
              return createResult(args)
              // return args.reduce(
              //   (acc, arg) => {
              //     if (arg.style) {
              //       const currStyle = acc.style
              //
              //       if (typeof acc.style === 'function') {
              //         acc.style = (state: any) => {
              //           return {
              //             ...currStyle(state),
              //             ...(typeof arg.style === 'function'
              //               ? arg.style(state)
              //               : arg.style),
              //           }
              //         }
              //       } else {
              //         if (typeof arg.style === 'function') {
              //           acc.style = (state: any) => ({
              //             ...currStyle,
              //             ...arg.style(state),
              //           })
              //         } else {
              //           acc.style = { ...currStyle, ...arg.style }
              //         }
              //       }
              //     }
              //
              //     if (arg.ref) {
              //       const currRef = acc.ref
              //
              //       acc.ref = (curr: Ref) => {
              //         currRef(curr)
              //         arg.ref(curr)
              //       }
              //     }
              //
              //     return acc
              //   },
              //   { ...result },
              // )
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
        }

        return createResult()
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

// TODO: move to configuration

const initMedia = () => {
  const w = typeof window === 'undefined' ? null : window

  const mediaSmall = w?.matchMedia('(min-width: 640px)')
  const mediaMedium = w?.matchMedia('(min-width: 768px)')
  const mediaLarge = w?.matchMedia('(min-width: 1024px)')

  const mediaEmitter = new Emitter<
    Partial<{
      '@media.small': boolean
      '@media.medium': boolean
      '@media.large': boolean
    }>
  >({
    '@media.small': mediaSmall?.matches,
    '@media.medium': mediaMedium?.matches,
    '@media.large': mediaLarge?.matches,
  })

  mediaSmall?.addListener((e) => {
    mediaEmitter.emit({ '@media.small': e.matches })
  })
  mediaMedium?.addListener((e) => {
    mediaEmitter.emit({ '@media.medium': e.matches })
  })
  mediaLarge?.addListener((e) => {
    mediaEmitter.emit({ '@media.large': e.matches })
  })

  return mediaEmitter
}

class Emitter<T extends Record<string, any>> {
  private listeners = new Set<(data: T) => void>()

  constructor(public data: T) {}

  emit(data: Partial<T>) {
    Object.assign(this.data, data)

    this.listeners.forEach((cb) => {
      cb(this.data)
    })
  }

  sub(listener: (data: T) => void) {
    this.listeners.add(listener)

    return () => this.listeners.delete(listener)
  }
}

import { getConfig } from '../config'
import { StyleMatcher } from '../StyleMatcher/StyleMatcher'
import {
  type Config,
  type ModType,
  type StylesheetValue,
  SYMBOL_INIT,
  SYMBOL_REF,
  type TokenStyleDeclaration,
  type TokenSystem,
  type Tokens,
} from '../types'

import { initMedia } from './initMedia'

type PseudoState = ':hover' | ':focus' | ':active'

// biome-ignore lint/suspicious/noExplicitAny: ignore
type AnyValue = any

type Ref = AnyValue
type RefStyle = AnyValue

const setStyles = (curr: Ref | undefined, styleObject: RefStyle) => {
  if (!curr) return

  // TODO: move to config
  if (curr.setNativeProps) {
    curr.setNativeProps({ style: styleObject.style })
  } else {
    if (styleObject.style) {
      curr.removeAttribute('style')
      Object.assign(curr.style, styleObject.style)
    }

    if (styleObject.className) {
      curr.className = styleObject.className
    }
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
  class LocalBase extends Base {}

  Object.entries(rules).forEach(([elementKey, _elementRule]) => {
    Object.defineProperty(LocalBase.prototype, elementKey, {
      get(this: LocalBase) {
        const result = this.config.getProps.call(this, elementKey)

        return result
      },
    })
  })

  return Object.assign({
    [SYMBOL_REF]: ref,
    [SYMBOL_INIT]: (config: Config, modsState: ModState) => {
      return new LocalBase({
        // TODO: fix types
        ref: ref as AnyValue,
        rules,
        config,
        modsState,
      })
    },
  })
}

type BaseRef = TokenSystem<TokenStyleDeclaration>
type BaseRules = StylesheetValue<AnyValue, AnyValue, AnyValue>

export class Base {
  config: Config

  ref: BaseRef
  rules: BaseRules

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
    ref,
    rules,
    config,
    modsState,
  }: {
    ref: BaseRef
    rules: BaseRules
    config?: Config
    modsState?: ModState
  }) {
    this.config = config ?? getConfig()

    this.ref = ref
    this.rules = rules

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
      console.log('update', mediaEmitter.data)

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

  getCurrentStyle(key: ElementKey) {
    const result = this.applyTokens(this.modsStyle[key])

    return result
  }

  applyTokens(value: ElementStyle): AppliedStyle {
    return this.ref.exec(
      { tokens: this.tokens, useClassName: this.config.useClassName },
      value,
    )
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

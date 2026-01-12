import { getConfig } from '../config.ts'
import { StyleMatcher } from '../StyleMatcher/StyleMatcher.ts'
import {
  type Config,
  type ModType,
  SYMBOL_INIT,
  SYMBOL_REF,
  SYMBOL_VARIANTS,
  type TokenStyleDeclaration,
  type TokenSystem,
  type Tokens,
} from '../types.ts'
import { initMedia } from './initMedia.ts'
import { unitlessNumbers } from './unitlessNumbers.ts'

type PseudoState = ':hover' | ':focus' | ':active'

// biome-ignore lint/suspicious/noExplicitAny: ignore
type AnyValue = any

type Ref = AnyValue
type RefStyle = AnyValue

const setStyles = (curr: Ref | undefined, styleObject: RefStyle) => {
  if (!curr) return

  // TODO: move to config
  if (curr.setNativeProps) {
    // TODO: how to merge with existing styles?
    curr.setNativeProps({ style: styleObject.style })
  } else {
    if (styleObject.style) {
      // can't remove style completely as element might styles from other sources
      // curr.removeAttribute('style');
      const result: Record<string, unknown> = {}

      for (const key in styleObject.style) {
        const v = styleObject.style[key]
        if (typeof v === 'number' && !unitlessNumbers.has(key)) {
          result[key] = v + 'px'
        } else {
          result[key] = v
        }
      }
      Object.assign(curr.style, result)
    }
    if (styleObject.className) {
      // TODO: handle existing classnames (not from toned)
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

/**
 * Transform new API format to internal format
 * New: { container: { ':hover': { bgColor: 'red' } }, 'container:hover': { label: { color: 'white' } } }
 * Internal: { container: { ':hover': { $container: { bgColor: 'red' }, $label: { color: 'white' } } } }
 */
function transformRulesToInternal(
  baseRules: AnyValue,
  variantRules?: AnyValue,
): AnyValue {
  const result: AnyValue = {}
  const elementSet = new Set<string>()

  // First pass: collect all element names
  for (const key in baseRules) {
    if (
      !key.startsWith('[') &&
      !key.includes(':') &&
      key !== 'prototype' &&
      key !== SYMBOL_VARIANTS.toString()
    ) {
      elementSet.add(key)
    }
  }

  // Also extract elements from cross-element selectors like 'container:hover'
  for (const key in baseRules) {
    if (key.includes(':') && !key.startsWith('[') && !key.startsWith(':')) {
      const elementName = key.split(':')[0]
      if (elementName) {
        elementSet.add(elementName)
      }
    }
  }

  // Second pass: process element definitions
  for (const elementKey of elementSet) {
    const elementRule = baseRules[elementKey]
    if (!elementRule) continue

    result[elementKey] = {}

    for (const ruleKey in elementRule) {
      if (ruleKey.startsWith(':')) {
        // Pseudo class on self - transform to internal format
        // { ':hover': { bgColor: 'red' } } -> { ':hover': { $container: { bgColor: 'red' } } }
        result[elementKey][ruleKey] = {
          [`$${elementKey}`]: elementRule[ruleKey],
        }
      } else if (ruleKey.startsWith('@')) {
        // Breakpoint on self - transform to internal format
        result[elementKey][ruleKey] = elementRule[ruleKey]
      } else {
        // Regular token property
        result[elementKey][ruleKey] = elementRule[ruleKey]
      }
    }
  }

  // Third pass: process cross-element selectors like 'container:hover'
  for (const key in baseRules) {
    if (key.includes(':') && !key.startsWith('[') && !key.startsWith(':')) {
      const parts = key.split(':')
      const elementName = parts[0]
      const pseudoClasses = parts.slice(1).map((p) => `:${p}`)

      if (!elementName || !elementSet.has(elementName)) continue

      const elementMap = baseRules[key]
      if (!elementMap) continue

      // Build nested pseudo structure
      let current = result[elementName] ??= {}

      for (let i = 0; i < pseudoClasses.length; i++) {
        const pseudo = pseudoClasses[i]!
        current[pseudo] ??= {}
        current = current[pseudo]
      }

      // Add element references
      for (const targetElement in elementMap) {
        current[`$${targetElement}`] = elementMap[targetElement]
      }
    }
  }

  // Fourth pass: process variants
  if (variantRules) {
    for (const selector in variantRules) {
      if (!selector.startsWith('[')) continue

      const elementMap = variantRules[selector]
      if (!elementMap) continue

      result[selector] = {}

      for (const elementKey in elementMap) {
        result[selector][`$${elementKey}`] = elementMap[elementKey]
      }
    }
  }

  return result
}

export function createStylesheet<
  S extends TokenStyleDeclaration,
  Mods extends ModType,
  T,
>(ref: TokenSystem<S>, rules: T, variantRules?: AnyValue) {
  // Transform rules to internal format
  const internalRules = transformRulesToInternal(rules, variantRules)

  class LocalBase extends Base {}

  // Get element keys (excluding selectors)
  const elementKeys = Object.keys(rules as object).filter(
    (k) =>
      !k.startsWith('[') &&
      !k.includes(':') &&
      k !== 'prototype' &&
      k !== SYMBOL_VARIANTS.toString(),
  )

  for (const elementKey of elementKeys) {
    Object.defineProperty(LocalBase.prototype, elementKey, {
      get(this: LocalBase) {
        const result = this.config.getProps.call(this, elementKey)
        return result
      },
    })
  }

  const stylesheet = Object.assign({
    [SYMBOL_REF]: ref,
    [SYMBOL_INIT]: (config: Config, modsState: ModState) => {
      return new LocalBase({
        // TODO: fix types
        ref: ref as AnyValue,
        rules: internalRules,
        config,
        modsState,
      })
    },
    // Add variants method for chaining
    variants: <M extends ModType>(newVariantRules: AnyValue) => {
      return createStylesheet<S, M, T>(ref, rules, newVariantRules)
    },
  })

  return stylesheet
}

type BaseRef = TokenSystem<TokenStyleDeclaration>
type BaseRules = AnyValue

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

    const mediaEmitter = initMedia(this.ref)

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

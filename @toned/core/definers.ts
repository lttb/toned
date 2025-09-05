import { getConfig } from './config'

import { createStylesheet } from './StyleSheet/StyleSheet'
import {
  type ModType,
  type StylesheetValue,
  SYMBOL_REF,
  type TokenConfig,
  type TokenSystem,
  type Tokens,
} from './types'

export const SYMBOL_STYLE = Symbol()
export const SYMBOL_ACCESS = Symbol()

export type { TokenSystem }

export function defineToken<
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  const Values extends readonly any[],
  // TODO: think about the result type (like, CSSProperties)
  Result extends {},
>(config: TokenConfig<Values, Result>) {
  return config
}

export function defineUnit<T>(
  resolver: (value: T, tokens: Tokens) => number | string,
) {
  return resolver
}

export function defineSystem<
  // biome-ignore lint/suspicious/noExplicitAny: ignore
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
          const tokens = getConfig().getTokens()

          return ref.exec({ tokens }, value)
        },
      }

      // biome-ignore lint/suspicious/noExplicitAny: ignore
      return result as any
    },
    stylesheet: (<Mods extends ModType, T>(
      rules: StylesheetValue<S, Mods, T>,
    ) => {
      return createStylesheet(ref, rules)
    }) as any,
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

        Object.assign(acc, system[k]?.resolve(v, config.tokens))

        return acc
      }, {})
    },
  }

  return ref
}

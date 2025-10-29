import { sym } from './utils.ts'

export const SYMBOL_REF = sym('SYMBOL_REF')
export const SYMBOL_INIT = sym('SYMBOL_INIT')

export type Tokens = Record<string, any>

// biome-ignore lint/suspicious/noExplicitAny: ignore
export type TokenConfig<Values extends readonly any[], Result> = {
  values: Values
  resolve: (value: Values[number], tokens: Tokens) => Result
}

export type Breakpoints<O extends Record<string, number>> = { __breakpoints: O }

type InferBreakpoints<R> = R extends { breakpoints?: Breakpoints<infer X> }
  ? X
  : never

// biome-ignore lint/suspicious/noExplicitAny: ignore
export type TokenStyleDeclaration = Record<string, TokenConfig<any, any>> & {
  breakpoints?: Breakpoints<any>
}

// biome-ignore lint/suspicious/noExplicitAny: ignore
type InlineStyle = any

export type TokenStyle<S extends TokenStyleDeclaration> = Partial<{
  [key in keyof S]: S[key]['values'][number]
}> & { style?: InlineStyle } & {
  // TODO: make at rules configurable
  // [key in `@media.${'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge'}`]?: Omit<
  //   TokenStyle<S>,
  //   `@media.${string}`
  // >
}

// biome-ignore lint/suspicious/noExplicitAny: ignore
type Merge<D extends any[]> = D extends [infer First, ...infer Rest]
  ? First & Merge<Rest>
  : []

export type TFun<S extends TokenStyleDeclaration> = <D extends TokenStyle<S>[]>(
  ...values: [...D]
) => Merge<D> & {
  /* @internal */
  [SYMBOL_REF]: TokenSystem<S>
}

export type ModType = Record<string, string | boolean | number>

export type Config = Readonly<{
  getTokens: () => Tokens

  useClassName: boolean
  useMedia: boolean

  //TODO
  getProps(this: any, elementKey: string): {}

  initRef: () => void
  initInteraction: () => void
}>

declare const _internalBrand: unique symbol
export type Stylesheet<
  S extends TokenStyleDeclaration,
  T extends Record<string, TokenStyle<S>>,
  M extends ModType = never,
> = {
  [key in keyof T]: ReturnType<TFun<S>>
} & {
  /* @internal */
  [SYMBOL_REF]: TokenSystem<S>
  /* @internal */
  [SYMBOL_INIT]: (
    config: Config,
    modState?: M,
  ) => {
    [key in keyof T]: ReturnType<TFun<S>>
  }
  // keep it in the shape so it won't collapse to {} after build
  [_internalBrand]?: never
}

export const SYMBOL_STATE = sym('SYMBOL_STATE')

export class C_<_T> {
  // static myStatic: T;
}

export interface Ctor {
  /* @internal */
  [SYMBOL_STATE]: this extends typeof C_<infer T> ? T : never
}

// biome-ignore lint/suspicious/noExplicitAny: ignore
export const C: typeof C_ & Ctor = C_ as any

export type Pseudo = ':hover' | ':active' | ':focus'

export type PickString<K> = K extends string ? K : never

type StringOrNumber = string | number | symbol

export type ElementStyle<
  S extends TokenStyleDeclaration,
  Elements extends string,
  Mods extends ModType,
  AvailablePseudo extends string,
  AvailableBreakpoints extends StringOrNumber,
> = TokenStyle<S> & {
  [PseudoKey in AvailablePseudo]?: ElementStyle<
    S,
    NoInfer<Elements>,
    Mods,
    NoInfer<Exclude<AvailablePseudo, PseudoKey>>,
    AvailableBreakpoints
  > &
    ElementList<
      S,
      NoInfer<Elements>,
      Mods,
      NoInfer<AvailablePseudo>,
      AvailableBreakpoints
    >
} & {
  [K in keyof Mods as `[${PickString<K>}=${Exclude<Mods[K], undefined>}]`]?: ElementStyle<
    S,
    NoInfer<Elements>,
    Omit<Mods, NoInfer<K>>,
    NoInfer<AvailablePseudo>,
    AvailableBreakpoints
  >
} & {
  [K in AvailableBreakpoints]?: ElementStyle<
    S,
    NoInfer<Elements>,
    Mods,
    NoInfer<AvailablePseudo>,
    NoInfer<Exclude<AvailableBreakpoints, K>>
  >
}

export type ElementList<
  S extends TokenStyleDeclaration,
  Elements extends string,
  Mods extends ModType,
  AvailablePseudo extends string,
  AvailableBreakpoints extends StringOrNumber,
> = {
  [ElementKey in `$${Elements}`]?: ElementStyle<
    S,
    Elements,
    Mods,
    AvailablePseudo,
    AvailableBreakpoints
  >
}

export type ModList<
  S extends TokenStyleDeclaration,
  Elements extends string,
  Mods extends ModType,
  AvailablePseudo extends string,
  AvailableBreakpoints extends StringOrNumber,
> = {
  [K in keyof Mods as `[${PickString<K>}=${Exclude<Mods[K], undefined>}]`]?: ElementList<
    S,
    Elements,
    Mods,
    AvailablePseudo,
    AvailableBreakpoints
  > &
    ModList<S, Elements, Omit<Mods, K>, AvailablePseudo, AvailableBreakpoints> &
    BreakpointsList<
      S,
      Elements,
      Omit<Mods, K>,
      AvailablePseudo,
      AvailableBreakpoints
    >
}

export type BreakpointsList<
  S extends TokenStyleDeclaration,
  Elements extends string,
  Mods extends ModType,
  AvailablePseudo extends string,
  AvailableBreakpoints extends StringOrNumber,
> = {
  [K in AvailableBreakpoints]?: ElementList<
    S,
    Elements,
    Mods,
    AvailablePseudo,
    NoInfer<Exclude<AvailableBreakpoints, K>>
  >
}

export type StylesheetValue<
  S extends TokenStyleDeclaration,
  Mods extends ModType,
  T,
> = {
  [K in keyof T as K extends `[${string}]` | 'prototype' ? never : K]: {
    $$type?: 'view' | 'text' | 'image'
  } & ElementStyle<
    S,
    NoInfer<
      PickString<
        Exclude<
          keyof NoInfer<T>,
          /* NoInfer<K> | */ `[${string}]` | 'prototype'
        >
      >
    >,
    Mods,
    Pseudo,
    keyof InferBreakpoints<S>
  >
} & ModList<
  S,
  PickString<
    Exclude<keyof NoInfer<T>, /* NoInfer<K> | */ `[${string}]` | 'prototype'>
  >,
  Mods,
  Pseudo,
  keyof InferBreakpoints<S>
> &
  BreakpointsList<
    S,
    PickString<
      Exclude<keyof NoInfer<T>, /* NoInfer<K> | */ `[${string}]` | 'prototype'>
    >,
    Mods,
    Pseudo,
    keyof InferBreakpoints<S>
  >

export type StylesheetType<S extends TokenStyleDeclaration> = (<
  Mods extends ModType,
  T extends StylesheetValue<S, Mods, T>,
>(
  style: { [SYMBOL_STATE]?: Mods } & T,
) => Stylesheet<S, Omit<T, `[${string}]` | 'prototype'>, Mods>) & {
  state: typeof C
}

export type TokenSystem<
  S extends TokenStyleDeclaration,
  Config extends { breakpoints?: Breakpoints<any> } = {
    breakpoints?: Breakpoints<any>
  },
> = {
  system: S
  config?: Config
  stylesheet: StylesheetType<S>
  t: TFun<S>
  exec: (
    config: {
      tokens: Tokens
      useClassName?: boolean
    },
    tokenStyle: TokenStyle<S>,
  ) => { style: object; className?: string }
}

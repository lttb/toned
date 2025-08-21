export const SYMBOL_REF: unique symbol = Symbol()
export const SYMBOL_INIT: unique symbol = Symbol()

export type Tokens = Record<string, string>

// biome-ignore lint/suspicious/noExplicitAny: ignore
export type TokenConfig<Values extends readonly any[], Result> = {
  values: Values
  resolve: (value: Values[number], tokens: Tokens) => Result
}

// biome-ignore lint/suspicious/noExplicitAny: ignore
export type TokenStyleDeclaration = Record<string, TokenConfig<any, any>>

// biome-ignore lint/suspicious/noExplicitAny: ignore
type InlineStyle = any

export type TokenStyle<S extends TokenStyleDeclaration> = Partial<{
  [key in keyof S]: S[key]['values'][number]
}> & { style?: InlineStyle }

// biome-ignore lint/suspicious/noExplicitAny: ignore
type Merge<D extends any[]> = D extends [infer First, ...infer Rest]
  ? First & Merge<Rest>
  : []

export type TFun<S extends TokenStyleDeclaration> = <D extends TokenStyle<S>[]>(
  ...values: [...D]
) => Merge<D> & {
  [SYMBOL_REF]: TokenSystem<S>
}

// biome-ignore lint/suspicious/noExplicitAny: ignore
type Ref = { current?: null | any }

export type ModType = Record<string, string | boolean | number>

export type Config = Readonly<{
  getTokens: () => Tokens

  initRef: () => void
  initInteraction: () => void
}>

export type Stylesheet<
  S extends TokenStyleDeclaration,
  T extends Record<string, TokenStyle<S>>,
  M extends ModType = never,
> = {
  [key in keyof T]: ReturnType<TFun<S>>
} & {
  // TODO: hide it from the public interface
  [SYMBOL_REF]: TokenSystem<S>
  [SYMBOL_INIT]: (
    config: Config,
    modState?: M,
  ) => {
    [key in keyof T]: ReturnType<TFun<S>>
  }
}

export const SYMBOL_STATE = '__symbol_state__'

export class C_<_T> {
  // static myStatic: T;
}

export interface Ctor {
  [SYMBOL_STATE]: this extends typeof C_<infer T> ? T : never
}

// biome-ignore lint/suspicious/noExplicitAny: ignore
export const C: typeof C_ & Ctor = C_ as any

export type Pseudo = ':hover' | ':active' | ':focus'

export type PickString<K> = K extends string ? K : never

export type ElementStyle<
  S extends TokenStyleDeclaration,
  Elements extends string,
  Mods extends ModType,
  AvailablePseudo extends string,
> = TokenStyle<S> & {
  [PseudoKey in AvailablePseudo]?: ElementStyle<
    S,
    NoInfer<Elements>,
    Mods,
    NoInfer<Exclude<AvailablePseudo, PseudoKey>>
  > &
    ElementList<S, NoInfer<Elements>, Mods, NoInfer<AvailablePseudo>>
} & {
  [K in keyof Mods as `[${PickString<K>}=${Exclude<Mods[K], undefined>}]`]?: ElementStyle<
    S,
    NoInfer<Elements>,
    Omit<Mods, NoInfer<K>>,
    NoInfer<AvailablePseudo>
  >
}

export type ElementList<
  S extends TokenStyleDeclaration,
  Elements extends string,
  Mods extends ModType,
  AvailablePseudo extends string,
> = {
  [ElementKey in `$${Elements}`]?: ElementStyle<
    S,
    Elements,
    Mods,
    AvailablePseudo
  >
}

export type ModList<
  S extends TokenStyleDeclaration,
  Elements extends string,
  Mods extends ModType,
  AvailablePseudo extends string,
> = {
  [K in keyof Mods as `[${PickString<K>}=${Exclude<Mods[K], undefined>}]`]?: ElementList<
    S,
    Elements,
    Mods,
    AvailablePseudo
  > &
    ModList<S, Elements, Omit<Mods, K>, AvailablePseudo>
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
    Pseudo
  >
} & ModList<
  S,
  PickString<
    Exclude<keyof NoInfer<T>, /* NoInfer<K> | */ `[${string}]` | 'prototype'>
  >,
  Mods,
  Pseudo
>

export type StylesheetType<S extends TokenStyleDeclaration> = (<
  Mods extends ModType,
  T extends StylesheetValue<S, Mods, T>,
>(
  style: { [SYMBOL_STATE]?: Mods } & T,
) => Stylesheet<S, Omit<T, `[${string}]` | 'prototype'>, Mods>) & {
  state: typeof C
}

export type TokenSystem<S extends TokenStyleDeclaration> = {
  system: S
  stylesheet: StylesheetType<S>
  t: TFun<S>
  exec: (
    config: {
      tokens: Tokens
    },
    tokenStyle: TokenStyle<S>,
  ) => object
}

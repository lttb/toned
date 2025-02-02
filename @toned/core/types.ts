import type { Token } from 'typescript'

export const SYMBOL_REF: unique symbol = Symbol()
export const SYMBOL_INIT: unique symbol = Symbol()

export type Tokens = Record<string, string>

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type TokenConfig<Values extends readonly any[], Result> = {
	values: Values
	resolve: (value: Values[number], tokens: Tokens) => Result
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type TokenStyleDeclaration = Record<string, TokenConfig<any, any>>

export type TokenStyle<S extends TokenStyleDeclaration> = Partial<{
	[key in keyof S]: S[key]['values'][number]
}>

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Merge<D extends any[]> = D extends [infer First, ...infer Rest]
	? First & Merge<Rest>
	: []

type TFun<S extends TokenStyleDeclaration> = <D extends TokenStyle<S>[]>(
	...values: [...D]
) => Merge<D> & {
	[SYMBOL_REF]: TokenSystem<S>
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Ref = { current?: null | any }

type ModType = Record<string, string | boolean | number>

export type Stylesheet<
	S extends TokenStyleDeclaration,
	T extends Record<string, TokenStyle<S>>,
	M extends ModType = Record<never, never>,
> = {
	[key in keyof T]: ReturnType<TFun<S>>
} & {
	// TODO: hide it from the public interface
	[SYMBOL_REF]: TokenSystem<S>
	[SYMBOL_INIT]: (ref: Ref) => {
		[key in keyof T]: ReturnType<TFun<S>>
	}

	with<Mods extends ModType>(modStyle: {}): Stylesheet<S, T, M>
}

export type TokenSystem<S extends TokenStyleDeclaration> = {
	system: S
	stylesheet: <
		const K extends string,
		const T extends Record<K, TokenStyle<S>>,
	>(
		style: T &
			Record<
				K,
				TokenStyle<S> & {
					// TODO: think about mix of states, like `:focus:active`
					[key in ':hover' | ':active' | ':focus']?: {
						// TODO: enforce type safety (currently it's possible to use non K keys)
						[key in K]?: TokenStyle<S>
					}
				}
			>,
	) => Stylesheet<S, T>
	t: TFun<S>
	exec: (
		config: {
			tokens: Tokens
		},
		tokenStyle: TokenStyle<S>,
	) => object
}

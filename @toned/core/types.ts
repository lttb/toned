export const SYMBOL_REF: unique symbol = Symbol()

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
) => Merge<D> & { [SYMBOL_REF]: TokenSystem<S> }

type Pseudo<T, S extends TokenStyleDeclaration> = {
	[key in ':hover' | ':active']?: {
		// Using type parameter K to maintain the relationship with T
		[K in keyof T & string]: K extends keyof T ? TokenStyle<S> : never
	}
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
				{
					[key in ':hover' | ':active' | ':focus']?: Partial<
						Record<keyof T, TokenStyle<S>>
					>
				}
			>,
	) => {
		[key in keyof T]: ReturnType<TFun<S>>
	} & { [SYMBOL_REF]: TokenSystem<S> }
	t: TFun<S>
	exec: (
		config: {
			tokens: Tokens
		},
		tokenStyle: TokenStyle<S>,
	) => object
}

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

export type TokenSystem<S extends TokenStyleDeclaration> = {
	system: S
	stylesheet: <const T extends Record<string, TokenStyle<S>>>(
		style: T,
	) => T & { ref: TokenSystem<S> }
	t: <D extends TokenStyle<S>>(value: D) => D & { ref: TokenSystem<S> }
	exec: (
		config: {
			tokens: Tokens
		},
		tokenStyle: TokenStyle<S>,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	) => { style: any }
}

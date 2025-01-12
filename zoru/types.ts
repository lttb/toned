export type Tokens = Record<string, string>

export type TokenConfig<Values extends readonly any[], Result> = {
	values: Values
	resolve: (value: Values[number], tokens: Tokens) => Result
}

export type TokenSystem<S extends Record<string, TokenConfig<any, any>>> = <
	C extends { tokens: Tokens },
>(
	config: C,
) => <
	V extends Partial<{
		[key in keyof S]: S[key]['values'][number]
	}>,
>(
	value: V,
) => { style: any }

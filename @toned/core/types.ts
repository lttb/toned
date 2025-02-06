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

export type ModType = Record<string, string | boolean | number>

export type Stylesheet<
	S extends TokenStyleDeclaration,
	T extends Record<string, TokenStyle<S>>,
	M extends ModType = never,
> = {
	[key in keyof T]: ReturnType<TFun<S>>
} & {
	// TODO: hide it from the public interface
	[SYMBOL_REF]: TokenSystem<S>
	[SYMBOL_INIT]: () => {
		[key in keyof T]: ReturnType<TFun<S>>
	}
}

const SYMBOL_STATE: unique symbol = Symbol.for('@toned/state')

class C_<T> {
	// static myStatic: T;
}

interface Ctor {
	[SYMBOL_STATE]: this extends typeof C_<infer T> ? T : never
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const C: typeof C_ & Ctor = C_ as any

type Pseudo = ':hover' | ':active' | ':focus'

type PickString<K> = K extends string ? K : never

type ElementStyle<
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

type ElementList<
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

type ModList<
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

export type TokenSystem<S extends TokenStyleDeclaration> = {
	system: S
	stylesheet: (<
		Mods extends ModType,
		T extends {
			[K in keyof T as K extends `[${string}]` | 'prototype'
				? never
				: K]: ElementStyle<
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
				Exclude<
					keyof NoInfer<T>,
					/* NoInfer<K> | */ `[${string}]` | 'prototype'
				>
			>,
			Mods,
			Pseudo
		>,
	>(
		style: { [SYMBOL_STATE]?: Mods } & T,
	) => Stylesheet<S, Omit<T, `[${string}]` | 'prototype'>, Mods>) & {
		state: typeof C
	}
	t: TFun<S>
	exec: (
		config: {
			tokens: Tokens
		},
		tokenStyle: TokenStyle<S>,
	) => object
}

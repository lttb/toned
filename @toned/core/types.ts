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

export type ModStyle<
	S extends TokenStyleDeclaration,
	T extends Record<string, TokenStyle<S>>,
	Mods extends ModType,
> = {
	[key in keyof Mods as key extends string
		? `[${key}=${Exclude<Mods[key], undefined>}]`
		: never]?: Partial<StyleWithPseudo<S, T>> & ModStyle<S, T, Omit<Mods, key>>
}

export type StylesheetWithState<
	S extends TokenStyleDeclaration,
	T extends Record<string, TokenStyle<S>>,
	M extends ModType,
> = StylesheetValue<S, T> & { __mods__: M }

export type StylesheetValue<
	S extends TokenStyleDeclaration,
	T extends Record<string, TokenStyle<S>>,
> = {
	[key in keyof T]: ReturnType<TFun<S>>
} & {
	// TODO: hide it from the public interface
	[SYMBOL_REF]: TokenSystem<S>
	[SYMBOL_INIT]: () => {
		[key in keyof T]: ReturnType<TFun<S>>
	}
}

export type Stylesheet<
	S extends TokenStyleDeclaration,
	T extends Record<string, TokenStyle<S>>,
> = StylesheetValue<S, T> & {
	with<Mods extends ModType>(
		modStyle: ModStyle<S, Record<keyof T, TokenStyle<S>>, Mods>,
	): StylesheetWithState<S, T, Mods>
}

export type StyleWithPseudo<
	S extends TokenStyleDeclaration,
	T extends Record<string, TokenStyle<S>>,
> = T &
	Record<
		keyof T,
		TokenStyle<S> & {
			// TODO: think about mix of states, like `:focus:active`
			[key in ':hover' | ':active' | ':focus']?: {
				// TODO: enforce type safety (currently it's possible to use non K keys)
				[key in keyof T]?: TokenStyle<S>
			}
		}
	>

type TotalStyle<
	S extends TokenStyleDeclaration,
	T extends Record<string, TokenStyle<S>>,
	Mods extends ModType,
> = StyleWithPseudo<S, T> & ModStyle<S, T, Mods>

const SYMBOL_STATE: unique symbol = Symbol.for('@toned/state')

class C_<T> {
	// static myStatic: T;
}

interface Ctor {
	[SYMBOL_STATE]: this extends typeof C_<infer T> ? T : never
}

const C: typeof C_ & Ctor = C_ as any

type Pseudo = ':hover' | ':active' | ':focus'

export type ModStyle2<Mods extends ModType, StyleValue> = {
	[key in keyof Mods as key extends string
		? `[${key}=${Exclude<Mods[key], undefined>}]`
		: never]: StyleValue & ModStyle2<Omit<Mods, key>, StyleValue>
}

type NestedStylesheetStyle<
	Mods extends ModType,
	T extends Record<string, any>,
	S extends TokenStyleDeclaration,
> = TokenStyle<S> & {
	'&:hover'?: NestedStylesheetStyle<Mods, T, S>
	':hover'?: Partial<Record<keyof T, NestedStylesheetStyle<Mods, T, S>>>
} & {
	[key in keyof Mods as key extends string
		? `[${key}=${Exclude<Mods[key], undefined>}]`
		: never]?: NestedStylesheetStyle<Omit<Mods, key>, T, S>
}

type StylesheetStyle<
	Mods extends ModType,
	T extends Record<string, any>,
	S extends TokenStyleDeclaration,
> = {
	[key in keyof T]: NestedStylesheetStyle<Mods, Omit<T, key>, S>
}

// type ElementStyle<S extends TokenStyleDeclaration> = TokenStyle<S>

type TopElementStyle<
	S extends TokenStyleDeclaration,
	Mods extends ModType,
	T extends Record<string, any>,
	CurrentElement extends string,
> = TokenStyle<S> & {
	// TODO: think about mix of states, like `:focus:active`
	[key in ':hover' | ':active' | ':focus']?: TokenStyle<S> & {
		// TODO: enforce type safety (currently it's possible to use non K keys)
		[Key in keyof T as `$${Key extends string ? Exclude<Key, `[${string}]`> : never}`]?: TokenStyle<S>
	}
} & {
	[key in keyof Mods as key extends string
		? `[${key}=${Exclude<Mods[key], undefined>}]`
		: never]?: TopElementStyle<S, Omit<Mods, key>, T, CurrentElement>
}

type NestedNested<S extends TokenStyleDeclaration, Mods extends ModType, T> = {
	[key in keyof Mods as key extends string
		? `[${key}=${Exclude<Mods[key], undefined>}]`
		: never]?: {
		[Key in Exclude<
			keyof T,
			'prototype' | `[${string}]`
		> as `$${Key extends string ? Key : never}`]?: ElementStyle<S>
	} & NestedNested<S, Omit<Mods, key>, T>
}

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
	) => Stylesheet<S, T>) & {
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

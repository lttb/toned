import { useContext, useMemo, type Context } from 'react'

import {
	type Tokens,
	type TokenSystem,
	type TokenStyle,
	type TokenStyleDeclaration,
	SYMBOL_REF,
} from '@runor/core/types'

export const create = (
	TokensContext: Context<Tokens>,
	get: (context: Tokens, prop: string) => string | number = (context, prop) =>
		context[prop],
) => {
	const useStyles = <
		S extends TokenStyleDeclaration,
		Styles extends ReturnType<TokenSystem<S>['stylesheet']>,
	>(
		tokenStyles: Styles,
	) => {
		const ctx = useContext(TokensContext)
		const s = useMemo(() => {
			const baseRef = tokenStyles[SYMBOL_REF]

			const tokens = new Proxy(ctx as Tokens, {
				get(_target, prop: string) {
					return get(_target, prop)
				},
			})

			const result = {
				//t: <V extends TokenStyle<S>>(value: V) => {
				//	return ref.exec({ tokens }, value)
				//},
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				...({} as {
					[key in Exclude<keyof Styles, typeof SYMBOL_REF>]: { style: any }
				}),
			}

			Object.entries(tokenStyles).forEach(([key, value]) => {
				const ref = value?.[SYMBOL_REF] ?? baseRef

				Object.defineProperty(result, key, {
					get() {
						return ref.exec({ tokens }, value)
					},
				})
			})

			return result
		}, [ctx, get, tokenStyles])

		return s
	}

	return { useStyles }
}

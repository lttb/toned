import { useContext, useMemo, type Context } from 'react'

import type {
	Tokens,
	TokenConfig,
	TokenSystem,
	TokenStyle,
	TokenStyleDeclaration,
} from './types'

export const create = (
	TokensContext: Context<Tokens>,
	get: (context: Tokens, prop: string) => string | number = (context, prop) =>
		context[prop],
) => {
	const useStyles = <
		S extends TokenStyleDeclaration,
		Styles extends ReturnType<TokenSystem<S>['stylesheet']>,
	>(
		styles: Styles,
	) => {
		const ctx = useContext(TokensContext)
		const s = useMemo(() => {
			// TODO: move ref to symbols
			const { ref, ...tokenStyles } = styles

			const tokens = new Proxy(ctx as Tokens, {
				get(_target, prop: string) {
					return get(_target, prop)
				},
			})

			const result = {
				t: <V extends TokenStyle<S>>(value: V) => {
					return ref.exec({ tokens }, value)
				},
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				...({} as { [key in keyof Styles]: { style: any } }),
			}

			Object.entries(tokenStyles).forEach(([key, value]) => {
				Object.defineProperty(result, key, {
					get() {
						return ref.exec({ tokens }, value)
					},
				})
			})

			return result
		}, [ctx, get, styles])

		return s
	}

	return { useStyles }
}

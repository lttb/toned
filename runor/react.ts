import { createContext, useMemo, useContext } from 'react'

import type { Tokens, TokenSystem, TokenStyle, TokenStyleDeclaration } from './types'
import { createAttach } from './react.common'

export const TokensContext = createContext<Tokens>(
	new Proxy({} as Tokens, {
		get(_target, prop: string) {
			return `var(--${prop})`
		},
	}),
)

export const useStyles = <
	S extends TokenStyleDeclaration,
	Styles extends ReturnType<TokenSystem<S>['stylesheet']>,
>(
  styles: Styles,
) => {
	const ctx = useContext(TokensContext)
	const s = useMemo(() => {
    // TODO: move ref to symbols
    const {ref, ...tokenStyles} = styles

    const result = {t: <V extends TokenStyle<S>>(value: V) => {
      return ref.exec({tokens: ctx}, value)
    }, ...({} as {[key in keyof Styles]: {style: any}})}

    Object.entries(tokenStyles).forEach(([key, value]) => {
      Object.defineProperty(result, key, {get() {
        return ref.exec({tokens: ctx}, value)
      }})
    })


    return result
  }, [ctx, styles])

	return s
}

export const attachSystem = createAttach(TokensContext)

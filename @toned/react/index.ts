import { useRef } from 'react'

import {
	SYMBOL_INIT,
	type TFun,
	type Stylesheet,
	type ModType,
	type TokenStyle,
	type TokenStyleDeclaration,
} from '@toned/core/types'

type UseStylesResult<
	S extends TokenStyleDeclaration,
	T extends Record<string, TokenStyle<S>>,
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
> = Record<keyof T, {}>

export function useStyles<
	S extends TokenStyleDeclaration,
	T extends Record<string, TokenStyle<S>>,
	M extends ModType = never,
>(stylesheet: Stylesheet<S, T, M>): UseStylesResult<S, T>

export function useStyles<
	S extends TokenStyleDeclaration,
	T extends Record<string, TokenStyle<S>>,
	M extends ModType,
>(stylesheet: Stylesheet<S, T, M>, state: NoInfer<M>): UseStylesResult<S, T>

export function useStyles<
	S extends TokenStyleDeclaration,
	T extends Record<string, TokenStyle<S>>,
	M extends ModType,
>(stylesheet: Stylesheet<S, T, M>, state?: M) {
	const ref = useRef<{
		stylesheet: Stylesheet<S, T, M>
		state?: M
		result: UseStylesResult<S, T>
	}>(null)

	if (ref.current?.stylesheet !== stylesheet) {
		ref.current = { stylesheet, state, result: stylesheet[SYMBOL_INIT](state) }
	}

	if (ref.current.state !== state) {
		// @ts-expect-error hidden API
		ref.current.result.applyState(state)
	}

	return ref.current.result
}

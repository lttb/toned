// @ts-expect-error
import { useRef } from 'react'

import {
	SYMBOL_INIT,
	type Stylesheet,
	type ModType,
	type TokenStyle,
	type TokenStyleDeclaration,
	type StylesheetWithState,
	type StylesheetValue,
} from '@toned/core/types'

type UseStylesResult<
	S extends TokenStyleDeclaration,
	T extends Record<string, TokenStyle<S>>,
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
> = Record<keyof T, {}>

export function useStyles<
	S extends TokenStyleDeclaration,
	T extends Record<string, TokenStyle<S>>,
>(stylesheet: Stylesheet<S, T>): UseStylesResult<S, T>

export function useStyles<
	S extends TokenStyleDeclaration,
	T extends Record<string, TokenStyle<S>>,
	M extends ModType,
>(
	stylesheet: StylesheetWithState<S, T, M>,
	state: NoInfer<M>,
): UseStylesResult<S, T>

export function useStyles<
	S extends TokenStyleDeclaration,
	T extends Record<string, TokenStyle<S>>,
>(stylesheet: StylesheetValue<S, T>, state?: ModType) {
	const ref = useRef()

	if (ref.current?.stylesheet !== stylesheet) {
		ref.current = { stylesheet, state, result: stylesheet[SYMBOL_INIT](state) }
	}

	if (ref.current.state !== state) {
		ref.current.result.applyState(state)
	}

	return ref.current.result
}

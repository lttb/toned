// @ts-expect-error
import { useRef } from 'react'

import {
	type Stylesheet,
	SYMBOL_INIT,
	type TokenStyle,
	type TokenStyleDeclaration,
} from '@toned/core/types'

export function useStyles<
	S extends TokenStyleDeclaration,
	T extends Record<string, TokenStyle<S>>,
>(stylesheet: Stylesheet<S, T>) {
	const ref = useRef()

	return stylesheet[SYMBOL_INIT](ref)
}

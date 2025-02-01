import { useRef } from 'react'

export function useStyles(stylesheet: any) {
	const ref = useRef()

	return stylesheet.__value__(ref)
}

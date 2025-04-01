import { useStyles } from '@toned/react/index'

import { styles } from '@examples/shared/button'

export function Button({ label }: { label: string }) {
	const s = useStyles(styles, {
		size: 'm',
		variant: 'accent',
	})

	return (
		<button type="button" {...s.container}>
			<span {...s.label}>{label}</span>
		</button>
	)
}

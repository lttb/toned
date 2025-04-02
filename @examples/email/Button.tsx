import { Link } from '@react-email/components'
import { useStyles } from '@toned/react'

import { styles } from '@examples/shared/button'

export function Button({ label }: { label: string }) {
	const s = useStyles(styles, {
		size: 'm',
		variant: 'accent',
	})

	return (
		<Link {...s.container}>
			<span {...s.label}>{label}</span>
		</Link>
	)
}

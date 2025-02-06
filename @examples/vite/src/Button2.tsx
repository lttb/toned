import { stylesheet } from '@toned/systems/base'
import { useStyles } from '@toned/react/index'
import { useState } from 'react'

const styles = stylesheet({
	...stylesheet.state<{
		size: 'm' | 's'
		variant: 'accent' | 'danger'
		alignment?: 'icon-only' | 'icon-left' | 'icon-right'
	}>,

	label: {
		alignContent: 'normal',

		':focus': {
			alignContent: 'space-around',

			$label: {},
		},
	},

	text: {
		':hover': {},
	},

	container: {
		':active': {},
	},
})
export function Button({ label }: { label: string }) {
	const [size] = useState<'m' | 's'>('m')

	const s = useStyles(styles, {
		size: size,
		variant: 'accent',
	})

	return (
		<button type="button" {...s.container}>
			<span {...s.label}>{label}</span>
		</button>
	)
}

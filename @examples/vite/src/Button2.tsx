import { stylesheet } from '@toned/systems/base'
import { useStyles } from '@toned/react/index'
import { useState } from 'react'

const styles = stylesheet({
	...stylesheet.state<{
		size: 'm' | 's'
		variant: 'accent' | 'danger'
		alignment?: 'icon-only' | 'icon-left' | 'icon-right'
	}>,

	container: {
		borderRadius: 'medium',
		borderWidth: 'none',

		':hover': {
			alignContent: 'normal',
		},
	},

	label: {
		textColor: 'default',

		'[alignment=icon-left]': {
			'[size=m]': {
				'[variant=accent]': {},
			},
		},
	},

	'[alignment=icon-left]': {},
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

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
		'[size=m]': {
			'[alignment=icon-left]': {
				'[variant=accent]': {
					':active': {},
				},
			},
		},

		':focus': {
			alignContent: 'space-around',

			$label: {},
		},
	},

	'[size=s]': {
		'[alignment=icon-left]': {
			'[variant=danger]': {
				$container: {
					':active': {
						':focus': {
							':hover': {},
						},
					},
				},
			},
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

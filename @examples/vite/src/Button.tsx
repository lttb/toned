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

		':active': {},

		style: {
			cursor: 'pointer',
		},
	},

	label: {
		// style: {
		// 	pointerEvents: 'none',
		// 	userSelect: 'none',
		// },
	},

	'[variant=accent]': {
		$container: {
			bgColor: 'action',

			':hover': {
				$container: {
					bgColor: 'action_secondary',
				},
				$label: {
					textColor: 'on_action_secondary',
				},
			},

			':active': {
				$container: {
					bgColor: 'destructive',
				},
				$label: {
					textColor: 'on_destructive',
				},
			},
		},

		$label: {
			textColor: 'on_action',
		},
	},

	'[size=m]': {
		$container: {
			paddingX: 4,
			paddingY: 2,
		},

		'[alignment=icon-only]': {
			$container: {
				paddingX: 2,
				paddingY: 2,
			},
		},
	},

	'[size=s]': {
		$container: {
			paddingX: 2,
			paddingY: 1,
		},

		'[alignment=icon-only]': {
			$container: {
				paddingX: 1,
				paddingY: 2,
			},
		},
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

import { stylesheet } from '@toned/systems/base'
import { useStyles } from '@toned/react/index'

const styles = stylesheet({
	container: {
		bgColor: 'action',
		borderRadius: 'medium',
		borderWith: 'none',

		style: {
			cursor: 'pointer',
		},

		':active': {
			container: {
				bgColor: 'destructive',
			},
			label: {
				textColor: 'on_destructive',
			},
		},

		':hover': {
			container: {
				bgColor: 'action_secondary',
			},
			label: {
				textColor: 'on_action_secondary',
			},
		},
	},

	label: {
		textColor: 'on_action',
		style: {
			pointerEvents: 'none',
			userSelect: 'none',
		},
	},
}).with<{
	size: 'm' | 's'
	variant: 'accent' | 'danger'
	alignment?: 'icon-only' | 'icon-left' | 'icon-right'
}>({
	'[size=m]': {
		container: {
			paddingX: 4,
			paddingY: 2,
		},

		'[alignment=icon-only]': {
			container: {
				paddingX: 2,
				paddingY: 2,
			},
		},
	},

	'[size=s]': {
		container: {
			paddingX: 2,
			paddingY: 1,
		},

		'[alignment=icon-only]': {
			container: {
				paddingX: 1,
				paddingY: 2,
			},
		},
	},
})

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

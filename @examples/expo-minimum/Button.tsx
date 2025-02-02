import { Pressable, Text } from 'react-native'

import { stylesheet } from '@toned/systems/base'
import { useStyles } from '@toned/react/index'

const styles = stylesheet({
	container: {
		bgColor: 'action',
		paddingX: 4,
		paddingY: 2,
		borderRadius: 'medium',
		borderWith: 'none',

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
			paddingX: 50,
			paddingY: 30,
		},

		'[alignment=icon-only]': {
			container: {
				paddingX: 30,
				paddingY: 30,
			},
		},
	},
})

export function Button({ label }: { label: string }) {
	const s = useStyles(styles, {
		size: 'm',
		variant: 'accent',
		alignment: 'icon-only',
	})

	return (
		<Pressable role="button" {...s.container}>
			<Text {...s.label}>{label}</Text>
		</Pressable>
	)
}

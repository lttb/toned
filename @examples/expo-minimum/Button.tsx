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
})

export function Button({ label }: { label: string }) {
	const s = useStyles(styles)

	console.log(s.label)

	return (
		<Pressable role="button" {...s.container}>
			<Text {...s.label}>{label}</Text>
		</Pressable>
	)
}

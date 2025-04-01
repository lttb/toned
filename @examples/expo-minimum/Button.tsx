import { Pressable, Text } from 'react-native'

import { useStyles } from '@toned/react'

import { styles } from '@examples/shared/button'

export function Button({ label }: { label: string }) {
	const s = useStyles(styles, {
		size: 'm',
		variant: 'accent',
	})

	return (
		<Pressable role="button" {...s.container}>
			<Text {...s.label}>{label}</Text>
		</Pressable>
	)
}

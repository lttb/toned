import { View, Text } from '@react-pdf/renderer'

import { useStyles } from '@toned/react'

import { styles } from '@examples/shared/button'

export function Button({ label }: { label: string }) {
	const s = useStyles(styles, {
		size: 'm',
		variant: 'accent',
	})

	console.log('button', {
		container: s.container.style,
		label: s.label.style,
	})

	return (
		<View
			{...s.container}
			style={{ ...s.container.style, borderWidth: 0.00005 }}
		>
			<Text {...s.label}>{label}</Text>
		</View>
	)
}

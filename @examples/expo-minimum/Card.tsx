import * as React from 'react'
import { Pressable, View, Text } from 'react-native'
import { useState } from 'react'

import { stylesheet, t } from '@toned/systems/base'
import { useStyles } from '@toned/react/index'

const styles = stylesheet({
	container: { bgColor: 'default' },
	button: {
		bgColor: 'action',
		paddingX: 4,
		paddingY: 2,
		borderRadius: 'medium',
		borderWith: 'none',

		':active': {
			button: {
				bgColor: 'destructive',
			},
			buttonLabel: {
				textColor: 'on_destructive',
			},
		},

		':hover': {
			button: {
				bgColor: 'action_secondary',
				// opacity: 0.4,
			},
			buttonLabel: {
				textColor: 'on_action_secondary',
			},
		},
	},
	buttonLabel: { textColor: 'on_action' },
	code: { textColor: 'destructive' },
})

function Card() {
	const s = useStyles(styles)
	const [count, setCount] = useState(0)

	return (
		<View {...s.container}>
			<Pressable {...s.button} onPress={() => setCount((count) => count + 1)}>
				<Text {...s.buttonLabel}>count is {count}</Text>
			</Pressable>

			<Text {...t({ textColor: 'status_info' })}>
				Edit <Text {...s.code}>src/App.tsx</Text> and save to test HMR
			</Text>
		</View>
	)
}

export default Card

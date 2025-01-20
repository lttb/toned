import * as React from 'react'
import { Pressable, View, Text } from 'react-native'
import { useState } from 'react'

import { stylesheet, t } from '@toned/systems/base'

const s = stylesheet({
	container: { bgColor: 'default' },
	button: {
		bgColor: 'action',
		textColor: 'on_action',
		paddingX: 4,
		paddingY: 2,
		borderRadius: 'medium',
		borderWith: 'none',
	},
	code: { textColor: 'destructive' },
})

function Card() {
	const [count, setCount] = useState(0)

	return (
		<View {...s.container}>
			<Pressable {...s.button} onPress={() => setCount((count) => count + 1)}>
				<Text {...t({ textColor: 'on_action' })}>count is {count}</Text>
			</Pressable>

			<Text {...t({ textColor: 'status_info' })}>
				Edit <Text {...s.code}>src/App.tsx</Text> and save to test HMR
			</Text>
		</View>
	)
}

export default Card

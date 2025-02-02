import { View, Text } from 'react-native'

import { stylesheet, t } from '@toned/systems/base'
import { useStyles } from '@toned/react/index'

import { Button } from './Button'

const styles = stylesheet({
	container: { bgColor: 'default' },
	code: { textColor: 'destructive' },
})

function Card() {
	const s = useStyles(styles)

	return (
		<View {...s.container}>
			<Button label={String(Math.random())} />

			<Text {...t({ textColor: 'status_info' })}>
				Edit <Text {...s.code}>src/App.tsx</Text> and save to test HMR
			</Text>
		</View>
	)
}

export default Card

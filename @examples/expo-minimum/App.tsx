import { TokensContext } from 'runor/react'
import shadcn from '@runor/themes/shadcn/config'

import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { t } from './runor'

const Content = () => {
	return (
		<Text>
			<View
				{...t({
					bgColor: 'action',
					paddingX: 4,
					paddingY: 2,
					borderRadius: 'medium',
					borderWith: 'none',
				})}
			>
				<Text
					{...t({
						textColor: 'on_action',
					})}
				>
					Open test
				</Text>
			</View>
			App.js to start working on your app!
		</Text>
	)
}

const Main = () => {
	return (
		<View style={styles.container}>
			<TokensContext.Provider value={shadcn}>
				<Content />
			</TokensContext.Provider>
			<StatusBar style="auto" />
		</View>
	)
}

export default function App() {
	return <Main />
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
})
